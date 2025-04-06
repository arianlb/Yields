import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;
    private readonly clientId = process.env.EMAIL_CLIENT_ID;
    private readonly clientSecret = process.env.EMAIL_CLIENT_SECRET;
    private readonly tenantId = process.env.EMAIL_TENANT_ID;
    private readonly userEmail = process.env.EMAIL_USER;
    
    constructor(private readonly httpService: HttpService) {}

    async sendEmail(to: string, url: string): Promise<void> {
        const accessToken = await this.refreshAccessToken();
        this.transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                type: 'OAuth2',
                user: this.userEmail,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                accessToken,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Reset Your Password',
            html: `
                <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${url}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
                `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            
        } catch (error) {
            this.logger.error('Error sending email', error);
            throw new InternalServerErrorException('Error sending email');
        }
    }

    private async refreshAccessToken(): Promise<string> {
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);
        params.append('grant_type', 'password');
        params.append('scope', 'https://outlook.office365.com/.default');
        params.append('username', this.userEmail);
        params.append('password', 'Sebanda#89.it');
        try {
            const response = await this.httpService.axiosRef.post(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            return response.data.access_token;
        } catch (error) {
            this.logger.error('Error getting access token from email', error);
            throw new InternalServerErrorException('Error getting access token from email');
        }
    }
}
