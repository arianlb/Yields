import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';
import { CreatePolicyDto } from './create-policy.dto';
import { Type } from 'class-transformer';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-26',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly cancellationDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  readonly renewalAgent?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  renewed?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly notes?: string[];
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly status?: string;
}
