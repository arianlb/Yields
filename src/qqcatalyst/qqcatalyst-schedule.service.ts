import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QqcatalystService } from './qqcatalyst.service';

@Injectable()
export class QqcatalystScheduleService {
  constructor(
    @Inject('SEBANDA_89')
    private readonly qqcatalystServiceA: QqcatalystService,
    @Inject('SEBANDA_117')
    private readonly qqcatalystServiceB: QqcatalystService,
  ) {}

  @Cron('0 58 7 * * 1-6', {
    name: 'preWorkQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handlePreWorkTask() {
    this.qqcatalystServiceA.handlePreWorkTask();
  }

  @Cron('0 */5 8-18 * * 1-6', {
    name: 'fiveMinutesQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handleFiveMinuteTask() {
    this.qqcatalystServiceA.handleFiveMinuteTask();
  }

  @Cron('0 59 23 * * *', {
    name: 'midnightQQCatalystTask',
    timeZone: 'America/New_York',
  })
  async handleDailyTask() {
    this.qqcatalystServiceA.handleDailyTask();
  }

  @Cron('0 59 7 * * 1-6', {
    name: 'preWorkQQCatalystTask117',
    timeZone: 'America/New_York',
  })
  async handlePreWorkTask117() {
    this.qqcatalystServiceB.handlePreWorkTask();
  }

  @Cron('10 */7 8-18 * * 1-6', {
    name: 'fiveMinutesQQCatalystTask117',
    timeZone: 'America/New_York',
  })
  async handleFiveMinuteTask117() {
    this.qqcatalystServiceB.handleFiveMinuteTask();
  }

  @Cron('0 57 23 * * *', {
    name: 'midnightQQCatalystTask117',
    timeZone: 'America/New_York',
  })
  async handleDailyTask117() {
    this.qqcatalystServiceB.handleDailyTask();
  }
}
