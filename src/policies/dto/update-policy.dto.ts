import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreatePolicyDto } from './create-policy.dto';
import { Type } from 'class-transformer';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
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
