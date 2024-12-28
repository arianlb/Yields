import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

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
}
