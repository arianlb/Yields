import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseUtcDatePipe implements PipeTransform {
  transform(value: string): Date {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const [, year, month, day] = match.map(Number);

    if (month < 1 || month > 12) {
      throw new BadRequestException('Invalid month');
    }
    if (day < 0 || day > 31) {
      throw new BadRequestException('Invalid day');
    }

    return new Date(
      Date.UTC(year, day === 0 ? month : month - 1, day, 0, 0, 0),
    );
  }
}
