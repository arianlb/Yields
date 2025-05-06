import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { CreateQqcatalystDto } from './dto/create-qqcatalyst.dto';
// import { UpdateQqcatalystDto } from './dto/update-qqcatalyst.dto';

@Injectable()
export class QqcatalystService {
  private readonly logger = new Logger('QQcatalystService');
  private readonly clientId = process.env.QQCATALYST_CLIENT_ID;
  private readonly clientSecret = process.env.QQCATALYST_CLIENT_SECRET;
  private readonly catalystUser = process.env.QQCATALYST_USER;
  private readonly tokenURL = 'https://login.qqcatalyst.com/oauth/token';
  private readonly apiURL = 'https://api.qqcatalyst.com/v1/';
  private accessToken: string | null = null;

  constructor(private readonly httpService: HttpService) {}

  private async getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'password');
    params.append('username', this.catalystUser);
    params.append('password', 'Insurance#89');

    try {
      const response = await this.httpService.axiosRef.post(this.tokenURL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
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
        await this.httpService.axiosRef.get(`${this.apiURL}BusinessLogic/Ping`, { headers });
      } catch (error) {
        this.accessToken = await this.getAccessToken();
      }
    }

  }

  async getUserData() {
    await this.checkAccessToken();
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/LastModifiedCreated?startDate=2025-05-05&endDate=2025-05-05&pageNumber=1&pageSize=20`;
      // const url = `${this.apiURL}BusinessLogic/Ping`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching data from QQCatalyst:', error);
      throw new InternalServerErrorException('Error fetching data from QQCatalyst');
    }
  }
}
