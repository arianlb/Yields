import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class PolicyNumbersDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  readonly policyNumbers: string[];
}
