import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';
import { Office, OfficeSchema } from './schemas/office.schema';

@Module({
  controllers: [OfficesController],
  providers: [OfficesService],
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema }]),
  ],
  exports: [OfficesService],
})
export class OfficesModule {}
