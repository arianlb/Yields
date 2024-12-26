import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './schemas/person.schema';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personModel.create(createPersonDto);
  }

  async findAll(): Promise<Person[]> {
    return this.personModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personModel.findById(id).lean().exec();
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = this.personModel
      .findByIdAndUpdate(id, updatePersonDto, { new: true })
      .lean()
      .exec();
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async remove(id: string): Promise<string> {
    const person = await this.personModel.findByIdAndDelete(id).lean().exec();
    if (!person) {
      throw new NotFoundException(`Person with id: '${id}' not found`);
    }
    return `Person with the id: '${id}' was removed`;
  }
}
