import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy } from './schemas/policy.schema';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectModel(Policy.name)
    private readonly policyModel: Model<Policy>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    return this.policyModel.create(createPolicyDto);
  }

  async findAll(): Promise<Policy[]> {
    return this.policyModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyModel.findById(id).lean().exec();
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    return policy;
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = this.policyModel
      .findByIdAndUpdate(id, updatePolicyDto, { new: true })
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
