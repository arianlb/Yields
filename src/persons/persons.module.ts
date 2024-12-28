import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonsService } from './persons.service';
import { PersonsController } from './persons.controller';
import { Person, PersonSchema } from './schemas/person.schema';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService],
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
    OfficesModule,
    UsersModule,
  ],
  exports: [PersonsService],
})
export class PersonsModule {}
