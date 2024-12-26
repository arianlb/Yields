import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService
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
      .lean()
      .exec();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }
    return {
      token: this.generateJWT({ uid: user._id }),
      user,
    };
  }

  async checkAuthStatus(user: UserDocument) {
    return {
      token: this.generateJWT({ uid: user._id })
    };
  }

  private generateJWT(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
