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
import { AssignPoliciesDto } from './dto/assign-policies.dto';
import { PolicySearchCriteriaDto } from './dto/policy-search-criteria.dto';

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

    const effectiveDate = new Date(createPolicyDto.effectiveDate);
    effectiveDate.setHours(0, 0, 0, 0);
    const expirationDate = new Date(createPolicyDto.expirationDate);
    expirationDate.setHours(0, 0, 0, 0);
    if (effectiveDate.getTime() >= expirationDate.getTime()) {
      throw new BadRequestException(
        `Expiration date must be greater than effective date`,
      );
    }
    createPolicyDto.effectiveDate = effectiveDate;
    createPolicyDto.expirationDate = expirationDate;

    if (createPolicyDto.cancellationDate) {
      const cancellation = new Date(createPolicyDto.cancellationDate);
      cancellation.setHours(0, 0, 0, 0);
      const cancellationDate = cancellation.getTime();
      createPolicyDto.cancellationDate = cancellation;
      if (
        cancellationDate < effectiveDate.getTime() ||
        cancellationDate > expirationDate.getTime()
      ) {
        throw new BadRequestException(
          `Cancellation date must be between effective date and expiration date`,
        );
      }
    }

    return this.policyModel.create({
      ...createPolicyDto,
      office: person.office,
    });
  }

  async findByQuery(policySearchCriteriaDto: PolicySearchCriteriaDto) {
    return this.policyModel.find(policySearchCriteriaDto).lean().exec();
  }

  async findByExpirationDate(
    officeId: string,
    { startDate, endDate }: DateSearchDto,
  ): Promise<Policy[]> {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return this.policyModel
      .find({
        office: officeId,
        expirationDate: { $gte: startDate, $lte: endDate },
        status: { $ne: 'C' },
      })
      .select(
        'policyNumber carrier line premium effectiveDate expirationDate renewed status notes person assignedAgent',
      )
      .populate('person', 'name phone')
      .populate('assignedAgent', 'name')
      .sort({ expirationDate: 1 })
      .lean()
      .exec();
  }

  async findByCancellationDate(
    officeId: string,
    { startDate, endDate }: DateSearchDto,
  ): Promise<Policy[]> {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return this.policyModel
      .find({
        office: officeId,
        cancellationDate: { $gte: startDate, $lte: endDate },
        status: 'C',
      })
      .select('policyNumber carrier line premium cancellationDate notes person')
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
    let policy;
    if (restDto.cancellationDate || restDto.effectiveDate || restDto.expirationDate) {
      policy = await this.policyModel.findById(id);
      
      if (!policy) {
        throw new NotFoundException(`Policy with id ${id} not found`);
      }

      const newPolicyData = {
        effectiveDate: restDto.effectiveDate || policy.effectiveDate,
        expirationDate: restDto.expirationDate || policy.expirationDate,
      };

      const effectiveDate = new Date(newPolicyData.effectiveDate);
      effectiveDate.setHours(0, 0, 0, 0);
      const expirationDate = new Date(newPolicyData.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);
      if (effectiveDate.getTime() >= expirationDate.getTime()) {
        throw new BadRequestException(
          `Expiration date must be greater than effective date`,
        );
      }
      restDto.effectiveDate = effectiveDate;
      restDto.expirationDate = expirationDate;
      
      if (restDto.cancellationDate) {
        const cancellation = new Date(restDto.cancellationDate);
        cancellation.setHours(0, 0, 0, 0);
        if (cancellation.getTime() < effectiveDate.getTime() || cancellation.getTime() > expirationDate.getTime()) {
          throw new BadRequestException(
            `Cancellation date must be between effective date and expiration date`,
          );
        }
        restDto.cancellationDate = cancellation;
      }
    }
    
    policy = this.policyModel
      .findByIdAndUpdate(id, restDto, { new: true })
      .lean()
      .exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async assignPoliciesToAgent({agentId, officeId, policyIds}: AssignPoliciesDto): Promise<Policy[]> {
    const agent = await this.usersService.findOne(agentId);
    if (!agent.offices.find((offId) => (offId as any).equals(officeId as any))) {
      throw new BadRequestException(
        `User with id ${agentId} does not have access to office with id ${officeId}`,
      );
    }
    const updatedPolicies = await this.policyModel
      .updateMany(
        { _id: { $in: policyIds }, office: officeId },
        { $set: { assignedAgent: agentId } },
        { new: true },
      )
      .lean()
      .exec();

    if (updatedPolicies.matchedCount === 0) {
      throw new NotFoundException(
        `No policies found with the provided ids`,
      );
    }

    return this.policyModel
      .find({ _id: { $in: policyIds } })
      .lean()
      .exec();
  }

  async remove(id: string): Promise<string> {
    const policy = await this.policyModel.findByIdAndDelete(id).lean().exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id: '${id}' not found`);
    }
    return `Policy with the id: '${id}' was removed`;
  }
}
