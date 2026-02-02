import { Injectable } from '@nestjs/common';

@Injectable()
export class DatetimeService {
  private readonly BUSINESS_TIMEZONE = 'America/New_York';

  startDateStringToUtc(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);

    const startDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const tzDate = this.zonedTimeToUtc(startDate, this.BUSINESS_TIMEZONE);
    const finalDate = new Date(
      startDate.getTime() + (startDate.getTime() - tzDate.getTime()),
    );
    return finalDate;
  }

  endDateStringToUtc(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);

    const endDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 499));
    const tzDate = this.zonedTimeToUtc(endDate, this.BUSINESS_TIMEZONE);
    const finalDate = new Date(
      endDate.getTime() + (endDate.getTime() - tzDate.getTime()),
    );
    return finalDate;
  }

  dateToUtcDay(date: Date) {
    date = new Date(date);
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();

    return new Date(Date.UTC(y, m, d, 0, 0, 0));
  }
  
  startDateToUtcDayRange(date: Date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();

    const startDate = new Date(Date.UTC(y, m, d, 0, 0, 0));
    const tzDate = this.zonedTimeToUtc(startDate, this.BUSINESS_TIMEZONE);
    const finalDate = new Date(
      startDate.getTime() + (startDate.getTime() - tzDate.getTime()),
    );
    return finalDate;
  }

  endDateToUtcDayRange(date: Date) {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth();
    const d = date.getUTCDate();

    const endDate = new Date(Date.UTC(y, m, d, 23, 59, 59, 499));
    const tzDate = this.zonedTimeToUtc(endDate, this.BUSINESS_TIMEZONE);
    const finalDate = new Date(
      endDate.getTime() + (endDate.getTime() - tzDate.getTime()),
    );
    return finalDate;
  }

  private zonedTimeToUtc(date: Date, timeZone: string): Date {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

    return new Date(
      `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}Z`,
    );
  }
}
