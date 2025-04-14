import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';
import { Office, OfficeSchema } from './schemas/office.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OfficesController],
  providers: [OfficesService],
  imports: [
    MongooseModule.forFeature([{ name: Office.name, schema: OfficeSchema }]),
    AuthModule,
  ],
  exports: [OfficesService],
})
export class OfficesModule {}
