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
  private offices = [];
  private users = [];

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

  async getLocationsInfo() {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Locations/UserLocationsV2`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching  from QQCatalyst:', error);
      throw new InternalServerErrorException(
        'Error fetching data from QQCatalyst',
      );
    }
  }
  
  async getContactsLastModifiedCreated( startDate: string, endDate: string, pageSize = 1 ): Promise<ContactsListResponse> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/LastModifiedCreated?startDate=${startDate}&endDate=${endDate}&pageSize=${pageSize}`;
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
        if (this.contactCacheList[i].DateLastModified !== contact.DateLastModified && (contact.ContactSubType === 'C' || contact.ContactSubType === 'P')) {
          response.push(contact);
        }
        i++;
      }
      else if (contact.ContactSubType === 'C' || contact.ContactSubType === 'P') {
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
    
    const preparedData = contacts.map(async (contact) => ({
      name: contact.DisplayName,
      phone: contact.Phone,
      since: new Date(new Date(contact.CreatedOn).getTime() - new Date().getTimezoneOffset() * 60 * 1000 * 2), // Ajuste de zona horaria
      source: await this.getSource(contact.EntityID, contact.LocationID),
      office: this.offices.find(office => office.qqOfficeId === contact.LocationID)?._id,
      isCustomer: (contact.ContactSubType === 'C')? await this.isCustomer(contact.EntityID) : false,
      notes: (await this.getContactNotes(contact.EntityID)).Data.map(note => note.Comment),
      agent: this.users.find(user => user.name === contact.AgentName)?._id,  //Esta buscando por nombre, hay que cambiarlo para que busque por qqUserId!!
      qqPersonId: contact.EntityID,
      status: contact.Status,
    }));
    return await Promise.all(preparedData);
  }

  private async getOffices() {
    const data = await this.getLocationsInfo();
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
      const users = await this.usersService.findAllByOffice(office._id, { limit: 10, page: 1 });
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

  private async getSource(entityId: number, locationId: number): Promise<string> {
    const { CustomerSource } = await this.getContactInfo(entityId);
    const office = this.offices.find(office => office.qqOfficeId === locationId);
    if (office && office.sources.includes(CustomerSource)) {
      return CustomerSource;
    }
    switch (CustomerSource) {
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
          if (personDto.status === 'D') {
            this.personsService.remove(existingPerson[0]._id.toString());
          }
          else {
            await this.personsService.update(existingPerson[0]._id.toString(), personDto);
          }
        }
        else if (personDto.status !== 'D') {
          await this.personsService.create(personDto);
        }
      } catch (error) {
        this.logger.error(`Error saving person with qqPersonId ${personDto.qqPersonId}:`, error);
      }
    }
    return 'Data processing completed';
  }

  private todayInTimeZone(tz: string, extraDays: number): string {
    const today = new Date();
    today.setUTCDate(today.getUTCDate() + extraDays);
    // 'en-CA' da formato YYYY-MM-DD sin librerías externas
    return today.toLocaleDateString('en-CA', { timeZone: tz });
  }

  // @Cron('0 58 7 * * 1-6', {
  //   name: 'preWorkQQCatalystTask',
  //   timeZone: 'America/New_York',
  // })
  // async handlePreWorkTask() {
  //   this.logger.log('Executing pre-work QQCatalyst task');
  //   await this.checkAccessToken();
  //   this.offices = await this.getOffices();
  //   this.users = await this.getUsersByOffice(this.offices);
  // }

  // @Cron('0 */5 8-18 * * 1-6', {
  //   name: 'fiveMinutesQQCatalystTask',
  //   timeZone: 'America/New_York',
  // })
  // async handleFiveMinuteTask() {
  //   this.logger.log('Executing every 5 minutes QQCatalyst task');
  //   const startDate = this.todayInTimeZone('America/New_York', 0);
  //   const endDate = this.todayInTimeZone('Etc/UTC', 1);
  //   const result = await this.dataProcessing({ startDate, endDate });
  //   this.logger.log(result);
  //   console.log(endDate);
  // }
  
  // @Cron('0 59 23 * * *', {
  //   name: 'midnightQQCatalystTask',
  //   timeZone: 'America/New_York',
  // })
  // async handleDailyTask() {
  //   this.logger.log('Executing midnight daily QQCatalyst task');
  //   const startDate = this.todayInTimeZone('America/New_York', 0);
  //   const endDate = this.todayInTimeZone('Etc/UTC', 1);
  //   this.contactCacheList = [];
  //   const result = await this.dataProcessing({ startDate, endDate });
  //   this.logger.log(result);
  //   this.contactCacheList = [];
  // }
}
