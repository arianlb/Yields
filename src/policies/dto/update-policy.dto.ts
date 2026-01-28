import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreatePolicyDto } from './create-policy.dto';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  readonly assignedAgent?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  renewed?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly renewalAgent?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly notes?: string[];
}
