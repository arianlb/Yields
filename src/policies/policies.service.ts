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
import { DatetimeService } from '../datetime/datetime.service';
import { AssignPoliciesDto } from './dto/assign-policies.dto';
import { PolicySearchCriteriaDto } from './dto/policy-search-criteria.dto';
import { DashboardData } from './interfaces/data-dashboard.interface';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectModel(Policy.name)
    private readonly policyModel: Model<Policy>,
    private readonly usersService: UsersService,
    private readonly personsService: PersonsService,
    private readonly datetimeService: DatetimeService,
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

    const effectiveDate = this.datetimeService.dateToUtcDay(
      createPolicyDto.effectiveDate,
    );
    const expirationDate = this.datetimeService.dateToUtcDay(
      createPolicyDto.expirationDate,
    );
    if (effectiveDate.getTime() >= expirationDate.getTime()) {
      throw new BadRequestException(
        `Expiration date must be greater than effective date`,
      );
    }
    createPolicyDto.effectiveDate = effectiveDate;
    createPolicyDto.expirationDate = expirationDate;

    if (createPolicyDto.cancellationDate) {
      const cancellationDate = this.datetimeService.dateToUtcDay(
        createPolicyDto.cancellationDate,
      );
      createPolicyDto.cancellationDate = cancellationDate;
      if (
        cancellationDate.getTime() < effectiveDate.getTime() ||
        cancellationDate.getTime() > expirationDate.getTime()
      ) {
        throw new BadRequestException(
          `Cancellation date must be between effective date and expiration date`,
        );
      }
    }

    return (
      await (
        await this.policyModel.create({
          ...createPolicyDto,
          office: person.office,
        })
      ).populate('person', 'name phone')
    ).populate('salesAgent', 'name');
  }

  async findByQuery(policySearchCriteriaDto: PolicySearchCriteriaDto) {
    if (policySearchCriteriaDto.effectiveDate) {
      const effectiveDateUtc = this.datetimeService.dateToUtcDay(
        policySearchCriteriaDto.effectiveDate,
      );
      policySearchCriteriaDto.effectiveDate = effectiveDateUtc;
    }
    return this.policyModel.find(policySearchCriteriaDto).populate('person', 'name phone').populate('salesAgent', 'name').lean().exec();
  }

  async findByExpirationDate(
    officeId: string,
    startDate,
    endDate,
  ): Promise<Policy[]> {
    return this.policyModel
      .find({
        office: officeId,
        expirationDate: { $gte: startDate, $lte: endDate },
        status: { $ne: 'C' },
      })
      .select(
        'policyNumber carrier line premium effectiveDate expirationDate renewed renewalAgent status notes person assignedAgent',
      )
      .populate('person', 'name phone')
      .populate('assignedAgent', 'name')
      .sort({ expirationDate: 1 })
      .lean()
      .exec();
  }

  async findByCancellationDate(
    officeId: string,
    startDate,
    endDate,
  ): Promise<Policy[]> {
    return this.policyModel
      .find({
        office: officeId,
        cancellationDate: { $gte: startDate, $lte: endDate },
        status: 'C',
      })
      .select(
        'policyNumber carrier line premium effectiveDate cancellationDate notes person salesAgent',
      )
      .populate('person', 'name phone')
      .populate('salesAgent', 'name')
      .sort({ cancellationDate: 1 })
      .lean()
      .exec();
  }

  async findDashboardData(officeId: string, startDate, endDate) {
    const response: DashboardData = {
      stats: [],
      topAgents: [],
      topSources: [],
    };
    const previousMonthStart = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() - 1,
        1,
        0,
        0,
        0,
      ),
    );
    const previousMonthEnd = new Date(
      Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 0, 0, 0, 0),
    );

    const [
      currentMonthContacts,
      previousMonthContacts,
      currentMonthCustomers,
      previousMonthCustomers,
      currentMonthRenewals,
      previousMonthRenewals,
      currentMonthCancellations,
      previousMonthCancellations,
      topAgentsAndSources,
    ] = await Promise.all([
      this.personsService.getCountByOffice(
        { office: officeId },
        startDate,
        endDate,
      ),
      this.personsService.getCountByOffice(
        { office: officeId },
        previousMonthStart,
        previousMonthEnd,
      ),
      this.personsService.getCountByOffice(
        { office: officeId, isCustomer: true },
        startDate,
        endDate,
      ),
      this.personsService.getCountByOffice(
        { office: officeId, isCustomer: true },
        previousMonthStart,
        previousMonthEnd,
      ),
      this.policyModel
        .countDocuments({
          office: officeId,
          renewed: true,
          expirationDate: { $gte: startDate, $lte: endDate },
        })
        .exec(),
      this.policyModel
        .countDocuments({
          office: officeId,
          renewed: true,
          expirationDate: { $gte: previousMonthStart, $lte: previousMonthEnd },
        })
        .exec(),
      this.policyModel
        .countDocuments({
          office: officeId,
          cancellationDate: { $gte: startDate, $lte: endDate },
          status: 'C',
        })
        .exec(),
      this.policyModel
        .countDocuments({
          office: officeId,
          cancellationDate: {
            $gte: previousMonthStart,
            $lte: previousMonthEnd,
          },
          status: 'C',
        })
        .exec(),
      this.personsService.getTheTopAgentsAndSources(
        officeId,
        startDate,
        endDate,
      ),
    ]);

    response.stats.push({
      name: 'Contacts',
      amount: currentMonthContacts,
      percentage:
        previousMonthContacts > 0
          ? Math.round(
              ((currentMonthContacts / previousMonthContacts) * 100 - 100) * 10,
            ) / 10
          : 100,
    });
    response.stats.push({
      name: 'Customers',
      amount: currentMonthCustomers,
      percentage:
        previousMonthCustomers > 0
          ? Math.round(
              ((currentMonthCustomers / previousMonthCustomers) * 100 - 100) *
                10,
            ) / 10
          : 100,
    });
    response.stats.push({
      name: 'Renewals',
      amount: currentMonthRenewals,
      percentage:
        previousMonthRenewals > 0
          ? Math.round(
              ((currentMonthRenewals / previousMonthRenewals) * 100 - 100) * 10,
            ) / 10
          : 100,
    });
    response.stats.push({
      name: 'Cancellations',
      amount: currentMonthCancellations,
      percentage:
        previousMonthCancellations > 0
          ? Math.round(
              ((currentMonthCancellations / previousMonthCancellations) * 100 -
                100) *
                10,
            ) / 10
          : 100,
    });

    response.topAgents = topAgentsAndSources.topAgents;
    response.topSources = topAgentsAndSources.topSources;
    return response;
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyModel.findById(id).lean().exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async findByPersonId(personId: string): Promise<Policy[]> {
    return this.policyModel
      .find({ person: personId })
      .select('policyNumber carrier effectiveDate expirationDate salesAgent')
      .populate('salesAgent', 'name')
      .lean()
      .exec();
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const { person, ...restDto } = updatePolicyDto;
    let policy;
    if (
      restDto.cancellationDate ||
      restDto.effectiveDate ||
      restDto.expirationDate
    ) {
      policy = await this.policyModel.findById(id);

      if (!policy) {
        throw new NotFoundException(`Policy with id ${id} not found`);
      }

      const newPolicyData = {
        effectiveDate: restDto.effectiveDate || policy.effectiveDate,
        expirationDate: restDto.expirationDate || policy.expirationDate,
      };

      const effectiveDate = this.datetimeService.dateToUtcDay(
        newPolicyData.effectiveDate,
      );
      const expirationDate = this.datetimeService.dateToUtcDay(
        newPolicyData.expirationDate,
      );
      if (effectiveDate.getTime() >= expirationDate.getTime()) {
        throw new BadRequestException(
          `Expiration date must be greater than effective date`,
        );
      }
      restDto.effectiveDate = effectiveDate;
      restDto.expirationDate = expirationDate;

      if (restDto.cancellationDate) {
        const cancellationDate = this.datetimeService.dateToUtcDay(
          restDto.cancellationDate,
        );
        if (
          cancellationDate.getTime() < effectiveDate.getTime() ||
          cancellationDate.getTime() > expirationDate.getTime()
        ) {
          throw new BadRequestException(
            `Cancellation date must be between effective date and expiration date`,
          );
        }
        restDto.cancellationDate = cancellationDate;
      }
    }

    policy = this.policyModel
      .findByIdAndUpdate(id, restDto, { new: true })
      .populate('person', 'name phone')
      .populate('assignedAgent', 'name')
      .lean()
      .exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async assignPoliciesToAgent({
    agentId,
    officeId,
    policyIds,
  }: AssignPoliciesDto): Promise<Policy[]> {
    const agent = await this.usersService.findOne(agentId);
    if (
      !agent.offices.find((offId) => (offId as any).equals(officeId as any))
    ) {
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
      throw new NotFoundException(`No policies found with the provided ids`);
    }

    return this.policyModel
      .find({ _id: { $in: policyIds } })
      .populate('assignedAgent', 'name')
      .populate('person', 'name phone')
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
