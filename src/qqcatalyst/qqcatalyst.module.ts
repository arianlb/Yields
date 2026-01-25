import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { QqcatalystService } from './qqcatalyst.service';
import { QqcatalystController } from './qqcatalyst.controller';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';
import { PersonsModule } from '../persons/persons.module';
import { PoliciesModule } from '../policies/policies.module';

@Module({
  controllers: [QqcatalystController],
  providers: [QqcatalystService],
  imports: [
    HttpModule,
    AuthModule,
    OfficesModule,
    UsersModule,
    PersonsModule,
    PoliciesModule,
  ],
})
export class QqcatalystModule {}
