import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { CreateQqcatalystDto } from './dto/create-qqcatalyst.dto';
// import { UpdateQqcatalystDto } from './dto/update-qqcatalyst.dto';

@Injectable()
export class QqcatalystService {
  private readonly clientId = '8ae5c57b-fccc-4a44-9915-8767480835e4';
  private readonly clientSecret = '6a4bfdf0-99c0-4f8c-b700-65467a7b3cd6';
  private readonly tokenURL = 'https://login.qqcatalyst.com/oauth/token';
  private readonly apiURL = 'https://api.qqcatalyst.com/v1/';

  constructor(private readonly httpService: HttpService) {}

  async getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'password');
    params.append('username', 'irenia@sebandainsurance.com');
    params.append('password', 'Insurance#89');

    try {
      const response = await this.httpService.axiosRef.post(this.tokenURL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('Access Token: ', response.data.access_token);
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw new InternalServerErrorException('Failed to fetch access token');
    }
  }

  async getUserData() {
    // const accessToken = await this.getAccessToken();
    const accessToken = process.env.QQCATALYST_ACCESS_TOKEN; // Use the environment variable directly
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const url = `${this.apiURL}Contacts/LastModifiedCreated?startDate=2025-04-23&endDate=2025-04-23&pageNumber=1&pageSize=20`;
      const response = await this.httpService.axiosRef.get(url, { headers });
      // console.log('User Data: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new InternalServerErrorException('Failed to fetch user data');
    }
  }
}
