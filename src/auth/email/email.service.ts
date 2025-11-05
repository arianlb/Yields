import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly clientId = process.env.EMAIL_CLIENT_ID;
  private readonly clientSecret = process.env.EMAIL_CLIENT_SECRET;
  private readonly tenantId = process.env.EMAIL_TENANT_ID;
  private readonly userEmail = process.env.EMAIL_USER;

  constructor(private readonly httpService: HttpService) {}

  async sendEmail(to: string, url: string): Promise<void> {
    const accessToken = await this.refreshAccessToken();
    const mailData = {
      message: {
        subject: 'Reset Your Password',
        body: {
          contentType: 'HTML',
          content: `
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${url}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
          `,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    };


    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to,
    //   subject: 'Reset Your Password',
    //   html: `
    //             <h1>Reset Your Password</h1>
    //             <p>Click the link below to reset your password:</p>
    //             <a href="${url}">Reset Password</a>
    //             <p>If you did not request this, please ignore this email.</p>
    //             `,
    // };

    try {
      await this.httpService.axiosRef.post(
        `https://graph.microsoft.com/v1.0/users/${this.userEmail}/sendMail`,
        mailData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new InternalServerErrorException('Error sending email');
    }
  }

  private async refreshAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'https://graph.microsoft.com/.default');
    try {
      const response = await this.httpService.axiosRef.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Error getting access token from email', error);
      throw new InternalServerErrorException(
        'Error getting access token from email',
      );
    }
  }
}
