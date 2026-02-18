import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly policyNumber: string;

  @ApiProperty({
    description: 'Instant in time (must include timezone or be UTC)',
    type: String,
    format: 'date-time',
    example: '2026-01-31T16:30:49+02:00',
  })
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @ApiProperty({
    description: 'Instant in time (must include timezone or be UTC)',
    type: String,
    format: 'date-time',
    example: '2026-01-31T16:30:49+02:00',
  })
  @Type(() => Date)
  @IsDate()
  expirationDate: Date;

  @ApiProperty({
    description: 'Instant in time (must include timezone or be UTC)',
    type: String,
    format: 'date-time',
    example: '2026-01-31T16:30:49+02:00',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cancellationDate?: Date;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly carrier: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly line: string;

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
  
  @ApiProperty()
  @IsOptional()
  @IsInt()
  readonly qqPriorPolicyId?: number;

  @ApiProperty()
  @Matches(/^(A|C|D|E)$/, {
    message: 'status must be one of the following values: A, C, D, E',
  })
  @IsOptional()
  @IsString()
  readonly status?: string;
}
