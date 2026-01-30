import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { SearchCriteriaDto } from './dto/search-criteria.dto';
import { DateSearchDto } from '../common/dto/date-search.dto';
import { Person } from './schemas/person.schema';
import { OfficesService } from '../offices/offices.service';
import { UsersService } from '../users/users.service';
import { Office } from '../offices/schemas/office.schema';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,
    private readonly officesService: OfficesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    if (!createPersonDto.name && !createPersonDto.phone) {
      throw new BadRequestException('Name or Phone is required');
    }
    let refOffice: Office;
    if (createPersonDto.agent) {
      const [user, office] = await Promise.all([
        this.usersService.findOne(createPersonDto.agent),
        this.officesService.findOne(createPersonDto.office),
      ]);
      let flag = true;
      user.offices.forEach((officeId) => {
        if (office._id.equals(officeId as any)) {
          flag = false;
        }
      });
      if (flag) {
        throw new BadRequestException(
          `User with id ${createPersonDto.agent} does not have access to office with id ${createPersonDto.office}`,
        );
      }
      refOffice = office;
    } else {
      refOffice = await this.officesService.findOne(createPersonDto.office);
    }
    if (
      createPersonDto.source &&
      !refOffice.sources.includes(createPersonDto.source)
    ) {
      throw new NotFoundException(
        `Office with id ${createPersonDto.office} does not have source ${createPersonDto.source}`,
      );
    }
    if (createPersonDto.name) {
      createPersonDto.name = this.capitalizeFirstLetter(createPersonDto.name);
    }
    return (await this.personModel.create(createPersonDto)).populate('agent', 'name');
  }

  async findAll(
    officeId: string,
    { startDate, endDate }: DateSearchDto,
  ): Promise<Person[]> {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return this.personModel
      .find({ office: officeId, since: { $gte: startDate, $lte: endDate } })
      .populate('agent', 'name')
      .sort({ since: 1 })
      .lean()
      .exec();
  }

  async findByQuery(searchCriteriaDto: SearchCriteriaDto) {
    if (searchCriteriaDto.name) {
      searchCriteriaDto.name = this.capitalizeFirstLetter(searchCriteriaDto.name);
    }
    return this.personModel.find(searchCriteriaDto).populate('agent', 'name').lean().exec();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personModel.findById(id).populate('agent', 'name').lean().exec();
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    if (updatePersonDto.name) {
      updatePersonDto.name = this.capitalizeFirstLetter(updatePersonDto.name);
    }
    const person = this.personModel
      .findByIdAndUpdate(id, updatePersonDto, { new: true })
      .populate('agent', 'name')
      .lean()
      .exec();
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async remove(id: string): Promise<Person> {
    return this.personModel.findByIdAndDelete(id).select('_id').lean().exec();
  }

  private capitalizeFirstLetter(str: string): string {
    str = str.toLowerCase();
    return str.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
