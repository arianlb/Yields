import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthsService } from './months.service';
import { MonthsController } from './months.controller';
import { Month, MonthSchema } from './schemas/month.schema';

@Module({
  controllers: [MonthsController],
  providers: [MonthsService],
  imports: [
    MongooseModule.forFeature([{ name: Month.name, schema: MonthSchema }]),
  ],
})
export class MonthsModule {}
