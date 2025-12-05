import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
import { ContactInfoResponse, ContactNotesResponse, ContactResponse, ContactsListResponse, PoliciesByClientResponse } from './interfaces';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';
import { PersonsService } from '../persons/persons.service';

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

  constructor(
    private readonly httpService: HttpService,
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
    private readonly personsService: PersonsService,
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

  private async checkAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    } else {
      // Check if the access token is still valid by making a simple request
      // If the request fails, refresh the token
      const headers = {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };
      try {
        await this.httpService.axiosRef.get(
          `${this.apiURL}BusinessLogic/Ping`,
          { headers },
        );
      } catch (error) {
        this.accessToken = await this.getAccessToken();
      }
    }
  }

  async getContactsLastModifiedCreated( startDate: string, endDate: string, pageSize = 1 ): Promise<ContactsListResponse> {
    // const todayDate = new Date().toISOString().substring(0,10);

    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}`;
      // const url = `${this.apiURL}BusinessLogic/Ping`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }
  
  async getContactInfo(contactId: number): Promise<ContactInfoResponse> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/${contactId}/AccountInfo`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }
  
  async getPoliciesByCustomer(customerId: number): Promise<PoliciesByClientResponse> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Policies/ByCustomer/${customerId}`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }
  
  async getContactNotes(contactId: number): Promise<ContactNotesResponse> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/${contactId}/Notes`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }
  
  async getPolicySummary(policyId: number) {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}PolicySummaryForApi?policyID=${policyId}`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }

  async dataProcessing({ startDate, endDate }: QqDateSearchDto) {
    await this.checkAccessToken();
    // const testDate = new Date().getTimezoneOffset(); te da la diferencia en minutos con UTC
    const { TotalItems } = await this.getContactsLastModifiedCreated(startDate, endDate, 1);
    const contactResponse = await this.getContactsLastModifiedCreated(startDate, endDate, TotalItems);
    const firstStep = this.cleanContactData(contactResponse.Data);
    const contactsToSave = await this.prepareContactData(firstStep);
    return this.saveContactData(contactsToSave);
  }

  private cleanContactData(contacts: ContactResponse[]) {
    let i = 0;
    const response: ContactResponse[] = [];
    for (const contact of contacts) {
      if (i < this.contactCacheList.length && this.contactCacheList[i].EntityID === contact.EntityID) {
        if (this.contactCacheList[i].DateLastModified !== contact.DateLastModified && contact.Status !== 'D') {
          response.push(contact);
        }
        i++;
      }
      else {
        if (contact.Status !== 'D') {
          response.push(contact);
        }
      }
    }
    this.contactCacheList = contacts;
    return response;
  }

  //Devuelve un DTO de persona listo para ser guardado en la base de datos
  private async prepareContactData(contacts: ContactResponse[]) {
    //Obtener los id de oficina y agente desde la base de datos
    const [offices, users] = await Promise.all([
      this.officesService.findAll(),
      this.usersService.findAll(),
    ]);
    
    const preparedData = contacts.map(async (contact) => ({
      name: contact.DisplayName,
      phone: contact.Phone,
      since: contact.CreatedOn, // revisar este campo con la zona horaria
      source: await this.getSource(contact.EntityID),
      office: offices.find(office => office.qqOfficeId === contact.LocationID)?._id,
      isCustomer: (contact.ContactSubType === 'C')? await this.isCustomer(contact.EntityID) : false,
      notes: (await this.getContactNotes(contact.EntityID)).Data.map(note => note.Comment),
      agent: users.find(user => user.name === contact.AgentName)?._id,  //Esta buscando por nombre, hay que cambiarlo para que busque por qqUserId!!
      qqPersonId: contact.EntityID,
    }));
    return await Promise.all(preparedData);
  }

  // ESTE METODO TENGO QUE CAMBIARLO!!!!
  private async getSource(entityId: number) {
    const { CustomerSource } = await this.getContactInfo(entityId);
    switch (CustomerSource) {
    case "Referral":
      return "Referral";
    case "Facebook":
      return "Referral";
    case "Walk In":
      return "Referral";
    case "Social Media Email":
      return "Email";
    case "Email Campaign":
      return "Email";
    case "Social Media Call":
      return "Call";
    case "WhatsApp":
      return "WhatsApp";

    default:
      return "";
    }
  }

  private async isCustomer(entityId: number) {
    const { Data } =  await this.getPoliciesByCustomer(entityId);
    return Data.length > 0;
  }

  async saveContactData(personDtos: any[]) {
    for (const personDto of personDtos) {
      try {
        const existingPerson = await this.personsService.findByQuery({ office: personDto.office , qqPersonId: personDto.qqPersonId });
        if (existingPerson.length > 0) {
          await this.personsService.update(existingPerson[0]._id.toString(), personDto);
        }
        else {
          await this.personsService.create(personDto);
        }
      } catch (error) {
        this.logger.error(`Error saving person with qqPersonId ${personDto.qqPersonId}:`, error);
      }
    }
    return 'Data processing completed';
  }

  // @Cron('0 */5 8-18 * * 1-6', {
  //   name: 'dailyQQCatalystTask',
  //   timeZone: 'America/New_York',
  // })
  // async handleDailyTask() {
  //   this.logger.log('Executing daily QQCatalyst task');
  //   const todayDate = new Date().toISOString().substring(0,10);
  //   await this.dataProcessing({ startDate: todayDate, endDate: todayDate });
  // }
}
