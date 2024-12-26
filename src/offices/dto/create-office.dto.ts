import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOfficeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  readonly name: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly sebanda: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  readonly sources: string[];
}
