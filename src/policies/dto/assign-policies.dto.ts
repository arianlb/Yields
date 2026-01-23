import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';

export class AssignPoliciesDto {
  @ApiProperty()
  @IsMongoId()
  readonly agentId: string;
  
  @ApiProperty()
  @IsMongoId()
  readonly officeId: string;

  @ApiProperty()
  @IsArray()
  @IsMongoId({ each: true })
  readonly policyIds: string[];
}
