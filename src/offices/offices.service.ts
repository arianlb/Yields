import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { Office } from './schemas/office.schema';

@Injectable()
export class OfficesService {
  private readonly logger = new Logger('OfficesService');
  constructor(
    @InjectModel(Office.name)
    private readonly officeModel: Model<Office>,
  ) {}

  async create(createOfficeDto: CreateOfficeDto): Promise<Office> {
    try {
      return this.officeModel.create(createOfficeDto);
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async findAll(): Promise<Office[]> {
    return this.officeModel.find().lean().exec();
  }

  async findOne(id: string): Promise<Office> {
    const office = await this.officeModel.findById(id).lean().exec();
    if (!office) {
      throw new NotFoundException(`Office with id ${id} not found`);
    }
    return office;
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    try {
      const office = this.officeModel
        .findByIdAndUpdate(id, updateOfficeDto, { new: true })
        .lean()
        .exec();
      if (!office) {
        throw new NotFoundException(`Office with id ${id} not found`);
      }
      return office;
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async remove(id: string): Promise<string> {
    const office = await this.officeModel.findByIdAndDelete(id).lean().exec();
    if (!office) {
      throw new NotFoundException(`Office with id: '${id}' not found`);
    }
    return `Office with the id: '${id}' was removed`;
  }

  private handelDBException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Office already exists, ${JSON.stringify(error.keyValue)}`,
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
