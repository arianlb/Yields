import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import {
  ChangePasswordDto,
  EmailUserDto,
  LoginUserDto,
  ResetPasswordDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check')
  @Auth()
  check(@GetUser() user: UserDocument) {
    return this.authService.checkAuthStatus(user);
  }

  @Post('forgat-password')
  @HttpCode(200)
  async forgotPassword(@Body() emailUserDto: EmailUserDto) {
    return this.authService.forgotPassword(emailUserDto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @Auth()
  async resetPassword(
    @GetUser() user: UserDocument,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user, resetPasswordDto.newPassword);
  }
  @Post('change-password')
  @HttpCode(200)
  @Auth()
  async changePassword(
    @GetUser() user: UserDocument,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
