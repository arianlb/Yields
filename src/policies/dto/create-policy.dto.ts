import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly policyNumber: string;

  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-26',
  })
  @Type(() => Date)
  @IsDate()
  readonly effectiveDate: Date;

  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-26',
  })
  @Type(() => Date)
  @IsDate()
  readonly expirationDate: Date;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly carrier: string;

  @ApiProperty()
  @IsPositive()
  readonly premium: number;

  @ApiProperty()
  @IsMongoId()
  readonly salesAgent: string;

  @ApiProperty()
  @IsMongoId()
  readonly person: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqPolicyId?: number;
}
