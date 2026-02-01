import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PersonsModule } from './persons/persons.module';
import { OfficesModule } from './offices/offices.module';
import { PoliciesModule } from './policies/policies.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { WebSocketsModule } from './web-sockets/web-sockets.module';
import { QqcatalystModule } from './qqcatalyst/qqcatalyst.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatetimeModule } from './datetime/datetime.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    PersonsModule,
    OfficesModule,
    PoliciesModule,
    MongooseModule.forRoot(process.env.MONGODB_CNN),
    CommonModule,
    AuthModule,
    WebSocketsModule,
    QqcatalystModule,
    ScheduleModule.forRoot(),
    DatetimeModule,
  ],
})
export class AppModule {}
