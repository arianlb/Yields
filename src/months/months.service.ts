import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import { Month } from './schemas/month.schema';

@Injectable()
export class MonthsService {
  private readonly logger = new Logger('MonthsService');
  constructor(
    @InjectModel(Month.name)
    private readonly monthModel: Model<Month>,
  ) {}

  async create(createMonthDto: CreateMonthDto): Promise<Month> {
    try {
      return this.monthModel.create(createMonthDto);
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async findAll(): Promise<Month[]> {
    return this.monthModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Month> {
    const month = await this.monthModel.findById(id).lean().exec();
    if (!month) {
      throw new NotFoundException(`Month with id ${id} not found`);
    }
    return month;
  }

  async update(id: string, updateMonthDto: UpdateMonthDto): Promise<Month> {
    try {
      const month = await this.monthModel
        .findByIdAndUpdate(id, updateMonthDto, { new: true })
        .lean()
        .exec();
      if (!month) {
        throw new NotFoundException(`Month with id ${id} not found`);
      }
      return month;
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async remove(id: string): Promise<string> {
    const month = await this.monthModel.findByIdAndDelete(id).lean().exec();
    if (!month) {
      throw new NotFoundException(`Month with id: '${id}' not found`);
    }
    return `Month with the id: '${id}' was removed`;
  }

  private handelDBException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Month already exists, ${JSON.stringify(error.keyValue)}`,
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
