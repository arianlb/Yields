import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailService } from './email/email.service';
import { ChangePasswordDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login({ username, password }: LoginUserDto) {
    /*if (username === process.env.SUPER_ADMIN) {
      return {
        token: this.generateJWT({ uid: '676c4de1e0bc6f4a76a605ce' }),
        user: {
          _id: '676c4de1e0bc6f4a76a605ce',
          email: 'superadmin@sebanda.net',
        }
      }
    }*/
    const user = await this.userModel
      .findOne({ email: username })
      .select('+password')
      .populate('offices', 'name sources')
      .lean()
      .exec();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }
    delete user.password;
    return {
      token: this.generateJWT({ uid: user._id }),
      user,
    };
  }

  async checkAuthStatus(user: UserDocument) {
    return {
      token: this.generateJWT({ uid: user._id }),
    };
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('Email not found');
    }
    const token = this.jwtService.sign({ uid: user._id }, { expiresIn: '15m' });
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendEmail(email, url);
    return 'Email sent';
  }

  async resetPassword({_id}: UserDocument, newPassword: string): Promise<string> {
    const user = await this.userModel.findById(_id).select('+password').exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    return 'Password reset successfully';
  }

  async changePassword({_id}: UserDocument, changePasswordDto: ChangePasswordDto): Promise<string> {
    const user = await this.userModel.findById(_id).select('+password').exec();
    if (!bcrypt.compareSync(changePasswordDto.currentPassword, user.password)) {
      throw new BadRequestException('Current password is not valid');
    }
    user.password = bcrypt.hashSync(changePasswordDto.newPassword, 10);
    await user.save();
    return 'Password changed successfully';
  }

  private generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
