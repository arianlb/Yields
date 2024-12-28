import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { Policy, PolicySchema } from './schemas/policy.schema';
import { UsersModule } from '../users/users.module';
import { PersonsModule } from '../persons/persons.module';

@Module({
  controllers: [PoliciesController],
  providers: [PoliciesService],
  imports: [
    MongooseModule.forFeature([{ name: Policy.name, schema: PolicySchema }]),
    UsersModule,
    PersonsModule,
  ],
})
export class PoliciesModule {}
