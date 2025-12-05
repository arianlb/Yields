import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
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

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqOfficeId?: number;
}
