import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QqDateSearchDto {
  @ApiProperty({ example: '2025-11-07' })
  @IsString()
  readonly startDate: string;

  @ApiProperty({ example: '2025-11-07' })
  @IsString()
  readonly endDate: string;
}
