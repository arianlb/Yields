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
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly phone?: number;

  @ApiProperty({
    description: 'Instant in time (must include timezone or be UTC)',
    type: String,
    format: 'date-time',
    example: '2026-01-31T16:30:49+02:00',
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

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqPersonId?: number;
}
