import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { CreatePolicyDto } from './create-policy.dto';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
  @ApiProperty()
  @IsOptional()
  @IsDate()
  readonly cancellationDate?: Date;
}
