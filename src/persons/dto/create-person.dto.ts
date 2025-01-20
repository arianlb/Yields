import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  readonly name?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly phone?: number;

  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-26',
  })
  @Type(() => Date)
  @IsDate()
  readonly since: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(1)
  readonly source?: string;

  @ApiProperty()
  @IsMongoId()
  readonly office: string;

  @ApiProperty()
  @IsOptional()
  readonly isCustomer?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  readonly agent?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly notes?: string[];
}
