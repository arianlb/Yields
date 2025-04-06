import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly newPassword: string;
}
