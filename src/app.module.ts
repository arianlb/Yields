import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PersonsModule } from './persons/persons.module';
import { OfficesModule } from './offices/offices.module';
import { PoliciesModule } from './policies/policies.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

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
  ],
})
export class AppModule {}
