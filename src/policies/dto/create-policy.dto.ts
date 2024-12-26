import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly policyNumber: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly sebanda: number;

  @ApiProperty()
  @IsDate()
  readonly effectiveDate: Date;

  @ApiProperty()
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
}
