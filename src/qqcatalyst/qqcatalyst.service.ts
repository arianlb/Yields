import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
import { PolicyNumbersDto } from './dto/policy-numbers.dto';
import { ContactResponse, PolicyResponse } from './interfaces';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';
import { PersonsService } from '../persons/persons.service';
import { PoliciesService } from '../policies/policies.service';
import { WebSocketsGateway } from '../web-sockets/web-sockets.gateway';

@Injectable()
export class QqcatalystService {
  private readonly logger = new Logger('QQcatalystService');
  private readonly clientId = process.env.QQCATALYST_CLIENT_ID;
  private readonly clientSecret = process.env.QQCATALYST_CLIENT_SECRET;
  private readonly catalystUser = process.env.QQCATALYST_USER;
  private readonly catalystPassword = process.env.QQCATALYST_PASSWORD;
  private readonly tokenURL = 'https://login.qqcatalyst.com/oauth/token';
  private readonly apiURL = 'https://api.qqcatalyst.com/v1/';
  private accessToken: string | null = null;
  private contactCacheList: ContactResponse[] = [];
  private policiesCacheList: PolicyResponse[] = [];
  private offices = [];
  private users = [];
  private taskRunning = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
    private readonly personsService: PersonsService,
    private readonly policiesService: PoliciesService,
    private readonly webSocketGateway: WebSocketsGateway,
  ) {}

  private async getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'password');
    params.append('username', this.catalystUser);
    params.append('password', this.catalystPassword);

    try {
      const response = await this.httpService.axiosRef.post(
        this.tokenURL,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      this.logger.error('Error fetching access token:', error);
      throw new InternalServerErrorException('Failed to fetch access token');
    }
  }

  async getQQCatalystRequest(url: string, requestFunc: string) {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    }
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      if (error.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 60000));
        this.logger.warn('Waiting 1 minute before retrying the request');
        this.accessToken = await this.getAccessToken();
        headers.Authorization = `Bearer ${this.accessToken}`;
        try {
          const response = await this.httpService.axiosRef.get(url, {
            headers,
          });
          return response.data;
        } catch (error) {
          this.logger.error(
            `Error fetching ${requestFunc} from QQCatalyst after token refresh:`,
            error,
          );
          throw new InternalServerErrorException(
            `Error fetching ${requestFunc} from QQCatalyst after token refresh`,
          );
        }
      }
      this.logger.error(
        `Error fetching ${requestFunc} from QQCatalyst:`,
        error,
      );
      throw new InternalServerErrorException(
        `Error fetching ${requestFunc} from QQCatalyst`,
      );
    }
  }

  async contactsProcessing({ startDate, endDate }: QqDateSearchDto) {
    const { Data, TotalItems } = await this.getQQCatalystRequest(
      `${this.apiURL}Contacts/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=100&pageNumber=1`,
      'ContactsLastModifiedCreated',
    );
    if (TotalItems > 100) {
      const totalPages = Math.ceil(TotalItems / 100);
      for (let page = 2; page <= totalPages; page++) {
        const pageData = await this.getQQCatalystRequest(
          `${this.apiURL}Contacts/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=100&pageNumber=${page}`,
          'ContactsLastModifiedCreated',
        );
        Data.push(...pageData.Data);
      }
    }
    const firstStep = this.cleanContactData(Data);
    const contactsToSave = await this.prepareContactData(firstStep);
    return this.saveContactData(contactsToSave);
  }

  private cleanContactData(contacts: ContactResponse[]) {
    let i = 0;
    const response: ContactResponse[] = [];
    for (const contact of contacts) {
      if (
        i < this.contactCacheList.length &&
        this.contactCacheList[i].EntityID === contact.EntityID
      ) {
        if (
          this.contactCacheList[i].DateLastModified !==
            contact.DateLastModified &&
          (contact.ContactSubType === 'C' || contact.ContactSubType === 'P')
        ) {
          response.push(contact);
        }
        i++;
      } else if (
        contact.ContactSubType === 'C' ||
        contact.ContactSubType === 'P'
      ) {
        response.push(contact);
      }
    }
    this.contactCacheList = contacts;
    return response;
  }

  //Devuelve un DTO de persona listo para ser guardado en la base de datos
  private async prepareContactData(contacts: ContactResponse[]) {
    if (this.offices.length === 0) {
      this.offices = await this.getOffices();
    }
    if (this.users.length === 0) {
      this.users = await this.getUsersByOffice(this.offices);
    }
    const preparedData = [];
    for (const contact of contacts) {
      const personDto = {
        name: contact.DisplayName,
        phone: contact.Phone,
        since: contact.CreatedOn,
        source: await this.getSource(contact.EntityID, contact.LocationID),
        office: this.offices.find(
          (office) => office.qqOfficeId === contact.LocationID,
        )?._id,
        isCustomer:
          contact.ContactSubType === 'C'
            ? await this.isCustomer(contact.EntityID)
            : false,
        notes: await this.getNotes(contact.EntityID),
        agent: this.users.find((user) => user.name === contact.AgentName)?._id, //Esta buscando por nombre, hay que cambiarlo para que busque por qqUserId!!
        qqPersonId: contact.EntityID,
        status: contact.Status,
      };
      preparedData.push(personDto);
    }
    return preparedData;
  }

  private async getOffices() {
    const data = await this.getQQCatalystRequest(
      `${this.apiURL}Locations/UserLocationsV2`,
      'LocationsInfo',
    );
    const offices = [];
    for (const location of data) {
      const office = await this.officesService.findByQQID(location.QQID);
      offices.push(office.pop());
    }
    return offices;
  }

  private async getUsersByOffice(offices: any[]) {
    let usersResult = [];
    for (const office of offices) {
      const users = await this.usersService.findAllByOffice(office._id, {
        limit: 10,
        page: 1,
      });
      if (usersResult.length > 0) {
        usersResult = this.mergeUsersByEmail(usersResult, users);
      } else {
        usersResult = users;
      }
    }
    return usersResult;
  }

  private mergeUsersByEmail(users1: any[], users2: any[]) {
    const combined = [...users1, ...users2];
    const map = new Map();
    for (const user of combined) {
      map.set(user.email, user);
    }
    return Array.from(map.values());
  }

  private async getSource(
    entityId: number,
    locationId: number,
  ): Promise<string> {
    const { CustomerSource } = await this.getQQCatalystRequest(
      `${this.apiURL}Contacts/${entityId}/AccountInfo`,
      'ContactInfo',
    );
    const office = this.offices.find(
      (office) => office.qqOfficeId === locationId,
    );
    if (office && office.sources.includes(CustomerSource)) {
      return CustomerSource;
    }
    switch (CustomerSource) {
      case 'Facebook':
        return 'Referral';
      case 'Walk In':
        return 'Referral';
      case 'Social Media Email':
        return 'Email';
      case 'Email Campaign':
        return 'Email';
      case 'Social Media Call':
        return 'Call';

      default:
        return '';
    }
  }

  private async isCustomer(entityId: number) {
    const { Data } = await this.getQQCatalystRequest(
      `${this.apiURL}Policies/ByCustomer/${entityId}`,
      'PoliciesByCustomer',
    );
    return Data.length > 0;
  }

  private async getNotes(entityId: number) {
    const { Data } = await this.getQQCatalystRequest(
      `${this.apiURL}Contacts/${entityId}/Notes`,
      'ContactNotes',
    );
    return Data.map((note) => note.Comment);
  }

  async saveContactData(personDtos: any[]) {
    for (const personDto of personDtos) {
      try {
        const existingPerson = await this.personsService.findByQuery({
          office: personDto.office,
          qqPersonId: personDto.qqPersonId,
        });
        if (existingPerson.length > 0) {
          if (personDto.status === 'D') {
            const removedPerson = await this.personsService.remove(
              existingPerson[0]._id.toString(),
            );
            const payload = {
              person: removedPerson,
              queryKey: [
                'persons',
                {
                  office: personDto.office.toString(),
                  year: personDto.since
                    .toLocaleDateString('en-CA')
                    .substring(0, 4),
                  month: personDto.since
                    .toLocaleDateString('en-CA')
                    .substring(5, 7),
                },
              ],
              action: 'delete',
            };
            this.webSocketGateway.emitChangePerson(payload);
          } else {
            const updatedPerson = await this.personsService.update(
              existingPerson[0]._id.toString(),
              personDto,
            );
            const payload = {
              person: updatedPerson,
              queryKey: [
                'persons',
                {
                  office: updatedPerson.office.toString(),
                  year: updatedPerson.since
                    .toLocaleDateString('en-CA')
                    .substring(0, 4),
                  month: updatedPerson.since
                    .toLocaleDateString('en-CA')
                    .substring(5, 7),
                },
              ],
              action: 'update',
            };
            this.webSocketGateway.emitChangePerson(payload);
          }
        } else if (personDto.status !== 'D') {
          const createdPerson = await this.personsService.create(personDto);
          const payload = {
            person: createdPerson,
            queryKey: [
              'persons',
              {
                office: createdPerson.office.toString(),
                year: createdPerson.since
                  .toLocaleDateString('en-CA')
                  .substring(0, 4),
                month: createdPerson.since
                  .toLocaleDateString('en-CA')
                  .substring(5, 7),
              },
            ],
            action: 'create',
          };
          this.webSocketGateway.emitChangePerson(payload);
        }
      } catch (error) {
        this.logger.error(
          `Error saving person with qqPersonId ${personDto.qqPersonId}:`,
          error,
        );
      }
    }
    return 'Contacts processing completed';
  }

  /// Trabajo con Polizas

  async insertPolicyManually({ policyNumbers }: PolicyNumbersDto) {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    }
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const policiesToSave = await this.httpService.axiosRef.post(
        `${this.apiURL}Policies/SearchByPolicyNumbers`,
        policyNumbers,
        { headers },
      );
      const policies = policiesToSave.data.PoliciesFound.filter((policy) =>
        this.isValidStatus(policy.Status),
      );
      const preparedPolicies = await this.preparePoliciesData(policies);
      return this.savePoliciesData(preparedPolicies);
    } catch (error) {
      this.logger.error(
        `Error fetching SearchByPolicyNumbers from QQCatalyst:`,
        error,
      );
      throw new InternalServerErrorException(
        `Error fetching SearchByPolicyNumbers from QQCatalyst`,
      );
    }
  }

  async policiesProcessing({ startDate, endDate }: QqDateSearchDto) {
    const { Data, TotalItems } = await this.getQQCatalystRequest(
      `${this.apiURL}Policies/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=100&pageNumber=1`,
      'PoliciesLastModifiedCreated',
    );
    if (TotalItems > 100) {
      const totalPages = Math.ceil(TotalItems / 100);
      for (let page = 2; page <= totalPages; page++) {
        const pageData = await this.getQQCatalystRequest(
          `${this.apiURL}Policies/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=100&pageNumber=${page}`,
          'PoliciesLastModifiedCreated',
        );
        Data.push(...pageData.Data);
      }
    }
    const firstStep = this.cleanPoliciesData(Data);
    const policiesToSave = await this.preparePoliciesData(firstStep);
    return this.savePoliciesData(policiesToSave);
  }

  private cleanPoliciesData(policies: PolicyResponse[]) {
    let i = 0;
    const response: PolicyResponse[] = [];
    for (const policy of policies) {
      if (
        i < this.policiesCacheList.length &&
        this.policiesCacheList[i].PolicyId === policy.PolicyId
      ) {
        if (
          this.policiesCacheList[i].DateLastModified !==
            policy.DateLastModified &&
          this.isValidStatus(policy.Status)
        ) {
          response.push(policy);
        }
        i++;
      } else if (this.isValidStatus(policy.Status)) {
        response.push(policy);
      }
    }
    this.policiesCacheList = policies;
    return response;
  }

  private async preparePoliciesData(policies: PolicyResponse[]) {
    // Lógica para preparar los datos de las pólizas si es necesario
    if (this.offices.length === 0) {
      this.offices = await this.getOffices();
    }
    if (this.users.length === 0) {
      this.users = await this.getUsersByOffice(this.offices);
    }
    const preparedPolicies = [];
    for (const policy of policies) {
      const preparedPolicy = {
        policyNumber: policy.PolicyNumber,
        effectiveDate: policy.EffectiveDate,
        expirationDate: policy.ExpirationDate,
        cancellationDate:
          policy.Status === 'C'
            ? await this.getCancelationDate(policy.PolicyId)
            : null,
        carrier: policy.WritingCarrier,
        line: policy.LOB,
        premium: policy.TotalPremium,
        qqPolicyId: policy.PolicyId,
        salesAgent: this.users.find((user) => user.name === policy.AgentName)
          ?._id,
        customer: policy.CustomerId,
        customerName: policy.CustomerName,
        status: policy.Status,
        priorPolicy: policy.PriorPolicyID,
        isDeleted: policy.IsDeleted,
        agentName: policy.AgentName,
      };
      preparedPolicies.push(preparedPolicy);
    }
    return preparedPolicies;
  }

  private async getCancelationDate(policyId: number) {
    const data = await this.getQQCatalystRequest(
      `${this.apiURL}Policies/${policyId}/Adjustments`,
      'PolicyAdjustments',
    );
    const cancellationAdjustment = data.find(
      (adjustment) => adjustment.AdjustmentType === 'C',
    );
    return cancellationAdjustment
      ? cancellationAdjustment.AdjustmentDate
      : null;
  }

  async savePoliciesData(policyDtos: any[]) {
    for (const policyDto of policyDtos) {
      try {
        // Lógica para guardar o actualizar las pólizas en la base de datos
        let existingPerson;
        existingPerson = await this.personsService.findByQuery({
          qqPersonId: policyDto.customer,
          name: policyDto.customerName,
        });
        if (existingPerson.length === 0) {
          //Si no existe la persona, se crea para asociar la póliza a esa persona
          const newPerson = await this.createCustomerIfNotExists(
            policyDto.customer,
          );
          existingPerson = [newPerson];
        }
        // Hay una probabilidad de que haya más de una persona con el mismo qqPersonId y nombre y eso hay que manejarlo!!
        if (existingPerson.length > 1) {
          this.logger.warn(
            `Multiple persons found with qqPersonId ${policyDto.customer} and name ${policyDto.customerName} for policy ${policyDto.policyNumber}`,
          );
          continue;
        }
        const personId = existingPerson[0]._id.toString();

        //Si la poliza tiene PriorPolicyId y se verifica que esta poliza es un Renewal, se busca la póliza anterior para marcarla como renovada
        if (
          policyDto.priorPolicy &&
          !policyDto.isDeleted &&
          (await this.isPolicyRenewal(policyDto.qqPolicyId))
        ) {
          this.editRenewedStatus(
            policyDto.priorPolicy,
            existingPerson[0].office,
            true,
            policyDto.agentName,
          );
        }

        const existingPolicy = await this.policiesService.findByQuery({
          office: existingPerson[0].office,
          policyNumber: policyDto.policyNumber,
        });
        if (existingPolicy) {
          //Si hay más de una póliza con el mismo número, se compara la fecha de vigencia para decidir si se actualiza o crea una nueva
          const policy = existingPolicy.find(
            (p) =>
              p.effectiveDate.getTime() ===
              new Date(policyDto.effectiveDate).getTime(),
          );
          if (policy) {
            // Si la póliza ya existe con la misma fecha de vigencia, actualizarla
            if (!policyDto.isDeleted) {
              await this.policiesService.update(policy._id.toString(), {
                ...policyDto,
                person: personId,
              });
            } else {
              //Si la poliza eliminada tiene PriorPolicyId y se verifica que esta poliza es un Renewal,
              //Se marca como no renovada la poliza anterior.
              if (
                policyDto.priorPolicy &&
                (await this.isPolicyRenewal(policyDto.qqPolicyId))
              ) {
                this.editRenewedStatus(
                  policyDto.priorPolicy,
                  existingPerson[0].office,
                  false,
                );
              }

              const policyRemoved = await this.policiesService.remove(
                policy._id.toString(),
              );
              const payload = {
                policy: policyRemoved,
                queryKey: [
                  'policies',
                  {
                    office: existingPerson[0].office.toString(),
                    year: policy.expirationDate
                      .toLocaleDateString('en-CA')
                      .substring(0, 4),
                    month: policy.expirationDate
                      .toLocaleDateString('en-CA')
                      .substring(5, 7),
                  },
                ],
                action: 'delete',
              };
              this.webSocketGateway.emitChangePolicy(payload);
            }
          } else {
            // Si no existe una póliza con la misma fecha de vigencia, crear una nueva
            if (!policyDto.isDeleted && policyDto.status !== 'P') {
              const newPolicy = await this.policiesService.create({
                ...policyDto,
                person: personId,
                office: existingPerson[0].office,
              });
              const payload = {
                policy: newPolicy,
                queryKey: [
                  'policies',
                  {
                    office: existingPerson[0].office.toString(),
                    year: newPolicy.expirationDate
                      .toLocaleDateString('en-CA')
                      .substring(0, 4),
                    month: newPolicy.expirationDate
                      .toLocaleDateString('en-CA')
                      .substring(5, 7),
                  },
                ],
                action: 'create',
              };
              this.webSocketGateway.emitChangePolicy(payload);
            }
          }
        } else {
          if (!policyDto.isDeleted && policyDto.status !== 'P') {
            const newPolicy = await this.policiesService.create({
              ...policyDto,
              person: personId,
              office: existingPerson[0].office,
            });
            const payload = {
              policy: newPolicy,
              queryKey: [
                'policies',
                {
                  office: existingPerson[0].office.toString(),
                  year: newPolicy.expirationDate
                    .toLocaleDateString('en-CA')
                    .substring(0, 4),
                  month: newPolicy.expirationDate
                    .toLocaleDateString('en-CA')
                    .substring(5, 7),
                },
              ],
              action: 'create',
            };
            this.webSocketGateway.emitChangePolicy(payload);
          }
        }
      } catch (error) {
        this.logger.error(
          `Error saving policy with qqPolicyId ${policyDto.qqPolicyId}:`,
          error,
        );
      }
    }
    return 'Policies processing completed';
  }

  private async createCustomerIfNotExists(customerId: number) {
    const contact = await this.getQQCatalystRequest(
      `${this.apiURL}Contacts/${customerId}/ContactSummaryDTO`,
      'ContactSummaryDTO',
    );
    const personDto = {
      name: contact.DisplayName,
      phone: contact.Phone,
      since: contact.CreatedOn,
      source: await this.getSource(contact.EntityID, contact.LocationID),
      office: this.offices.find(
        (office) => office.qqOfficeId === contact.LocationID,
      )?._id,
      isCustomer: true,
      agent: this.users.find((user) => user.name === contact.AgentName)?._id, //Esta buscando por nombre, hay que cambiarlo para que busque por qqUserId!!
      qqPersonId: contact.EntityID,
    };
    const newPerson = await this.personsService.create(personDto);
    return newPerson;
  }

  private async isPolicyRenewal(qqPolicyId: number): Promise<boolean> {
    const policy = await this.getQQCatalystRequest(
      `${this.apiURL}PolicySummaryForApi?policyID=${qqPolicyId}`,
      'PolicySummaryForApi',
    );
    return policy.BusinessType === 'R';
  }

  private async editRenewedStatus(
    priorPolicyId: number,
    office: string,
    renewed: boolean,
    renewalAgent = '',
  ) {
    const existingPolicies = await this.policiesService.findByQuery({
      office,
      qqPolicyId: priorPolicyId,
    });
    if (existingPolicies.length > 0) {
      const policy = existingPolicies[0];
      const updatedPolicy = await this.policiesService.update(
        policy._id.toString(),
        {
          renewed,
          renewalAgent,
        },
      );
      const payload = {
        policy: updatedPolicy,
        queryKey: [
          'policies',
          {
            office: office.toString(),
            year: updatedPolicy.expirationDate
              .toLocaleDateString('en-CA')
              .substring(0, 4),
            month: updatedPolicy.expirationDate
              .toLocaleDateString('en-CA')
              .substring(5, 7),
          },
        ],
        action: 'update',
      };
      this.webSocketGateway.emitChangePolicy(payload);
    }
  }

  // private async isAnotherRenewalExists(priorPolicyId: number, customerId: number): Promise<boolean> {
  //   const { Data } = await this.getQQCatalystRequest(
  //     `${this.apiURL}Policies/ByCustomer/${customerId}`,
  //     'PoliciesByCustomer',
  //   );
  //   for (const policy of Data) {
  //     if (policy.PolicyId !== priorPolicyId && policy.Status !== 'E') {
  //       const newPolicy = await this.getQQCatalystRequest(
  //         `${this.apiURL}PolicySummaryForApi?policyID=${policy.PolicyId}`,
  //         'PolicySummaryForApi',
  //       );
  //       if (newPolicy.PriorPolicyId === priorPolicyId && newPolicy.BusinessType === 'R') {
  //         return true;
  //       }
  //     }
  //   }
  //   return false;
  // }

  private isValidStatus(status: string): boolean {
    const validStatuses = ['A', 'C', 'D', 'E'];
    return validStatuses.includes(status);
  }

  /// Utilidades de zona horaria para las tareas programadas

  private todayInTimeZone(tz: string, extraDays: number): string {
    const today = new Date();
    today.setUTCDate(today.getUTCDate() + extraDays);
    // 'en-CA' da formato YYYY-MM-DD sin librerías externas
    return today.toLocaleDateString('en-CA', { timeZone: tz });
  }

  @Cron('0 58 7 * * 1-6', {
    name: 'preWorkQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handlePreWorkTask() {
    this.logger.log('Executing pre-work QQCatalyst task');
    this.offices = await this.getOffices();
    this.users = await this.getUsersByOffice(this.offices);
  }

  @Cron('0 */5 8-18 * * 1-6', {
    name: 'fiveMinutesQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handleFiveMinuteTask() {
    if (!this.taskRunning) {
      this.taskRunning = true;
      this.logger.log('Executing every 5 minutes QQCatalyst task');
      const startDate = this.todayInTimeZone('America/New_York', 0);
      const endDate = this.todayInTimeZone('Etc/UTC', 1);
      const result = await this.contactsProcessing({ startDate, endDate });
      this.logger.log(result);
      const policiesResult = await this.policiesProcessing({ startDate, endDate });
      this.logger.log(policiesResult);
      this.taskRunning = false;
    }
  }

  @Cron('0 59 23 * * *', {
    name: 'midnightQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handleDailyTask() {
    this.logger.log('Executing midnight daily QQCatalyst task');
    const startDate = this.todayInTimeZone('America/New_York', 0);
    const endDate = this.todayInTimeZone('Etc/UTC', 1);
    this.contactCacheList = [];
    const result = await this.contactsProcessing({ startDate, endDate });
    this.logger.log(result);
    this.contactCacheList = [];
    this.policiesCacheList = [];
    const policiesResult = await this.policiesProcessing({ startDate, endDate });
    this.logger.log(policiesResult);
    this.policiesCacheList = [];
  }
}
