import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy } from './schemas/policy.schema';
import { UsersService } from '../users/users.service';
import { PersonsService } from '../persons/persons.service';
import { DateSearchDto } from '../common/dto/date-search.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectModel(Policy.name)
    private readonly policyModel: Model<Policy>,
    private readonly usersService: UsersService,
    private readonly personsService: PersonsService,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    const [user, person] = await Promise.all([
      this.usersService.findOne(createPolicyDto.salesAgent),
      this.personsService.findOne(createPolicyDto.person),
    ]);

    let flag = true;
    user.offices.forEach((officeId) => {
      if ((person.office as any).equals(officeId as any)) {
        flag = false;
      }
    });
    if (flag) {
      throw new BadRequestException(
        `User with id ${createPolicyDto.salesAgent} does not have access to office with id ${person.office}`,
      );
    }

    return this.policyModel.create({
      ...createPolicyDto,
      office: person.office,
    });
  }

  async findByPolicyNumber(
    officeId: string,
    policyNumber: string,
  ): Promise<Policy[]> {
    return this.policyModel
      .find({ office: officeId, policyNumber })
      .lean()
      .exec();
  }

  async findByExpirationDate(
    officeId: string,
    { startDate, endDate }: DateSearchDto,
  ): Promise<Policy[]> {
    return this.policyModel
      .find({
        office: officeId,
        expirationDate: { $gte: startDate, $lte: endDate },
        cancellationDate: null,
      })
      .select(
        'policyNumber carrier premium expirationDate renewed status notes person renewalAgent',
      )
      .populate('person', 'name phone')
      .populate('renewalAgent', 'name')
      .sort({ expirationDate: 1 })
      .lean()
      .exec();
  }

  async findByCancellationDate(
    officeId: string,
    { startDate, endDate }: DateSearchDto,
  ): Promise<Policy[]> {
    return this.policyModel
      .find({
        office: officeId,
        cancellationDate: { $gte: startDate, $lte: endDate },
      })
      .select('policyNumber carrier premium cancellationDate notes person')
      .populate('person', 'name phone')
      .sort({ cancellationDate: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyModel.findById(id).lean().exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const { person, ...restDto } = updatePolicyDto;
    const policy = this.policyModel
      .findByIdAndUpdate(id, restDto, { new: true })
      .lean()
      .exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async remove(id: string): Promise<string> {
    const policy = await this.policyModel.findByIdAndDelete(id).lean().exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id: '${id}' not found`);
    }
    return `Policy with the id: '${id}' was removed`;
  }
}
