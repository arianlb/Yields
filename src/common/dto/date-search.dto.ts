import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DateSearchDto {
  @ApiProperty({
    description: 'Start date (business date in America/New_York)',
    type: String,
    format: 'date-time',
    example: '2026-01-31',
  })
  @Type(() => Date)
  @IsDate()
  readonly startDate: Date;

  @ApiProperty({
    description: 'End date (business date in America/New_York)',
    type: String,
    format: 'date-time',
    example: '2026-01-31',
  })
  @Type(() => Date)
  @IsDate()
  readonly endDate: Date;
}
