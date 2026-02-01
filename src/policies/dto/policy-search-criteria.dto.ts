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

export class PolicySearchCriteriaDto {
  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  readonly office?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  policyNumber?: string;

  @ApiProperty({
    description: 'Instant in time (must include timezone or be UTC)',
    type: String,
    format: 'date-time',
    example: '2026-01-31T16:30:49+02:00',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  effectiveDate?: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  readonly qqPolicyId?: number;
}
