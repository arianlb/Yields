import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly name: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  readonly offices: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  readonly roles: string[];

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqUserId?: number;
}
