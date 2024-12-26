import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateMonthDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  readonly name: number;
}
