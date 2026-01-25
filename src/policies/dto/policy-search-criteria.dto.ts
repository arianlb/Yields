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
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2026-12-26',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  readonly effectiveDate?: Date;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  readonly qqPolicyId?: number;
}
