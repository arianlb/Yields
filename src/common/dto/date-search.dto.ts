import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DateSearchDto {
  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-01',
  })
  @Type(() => Date)
  @IsDate()
  readonly startDate: Date;

  @ApiProperty({
    description: 'The start date in YYYY-MM-DD format',
    type: String,
    format: 'date',
    example: '2024-12-31',
  })
  @Type(() => Date)
  @IsDate()
  readonly endDate: Date;
}
