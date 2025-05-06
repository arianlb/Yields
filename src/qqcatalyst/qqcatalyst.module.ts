import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { QqcatalystService } from './qqcatalyst.service';
import { QqcatalystController } from './qqcatalyst.controller';

@Module({
  controllers: [QqcatalystController],
  providers: [QqcatalystService],
  imports: [HttpModule],
})
export class QqcatalystModule {}
