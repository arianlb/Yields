import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OfficesService } from '../offices/offices.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly officesSeervice: OfficesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const searchesPromises = [];
    createUserDto.offices.forEach((officeId) => {
      searchesPromises.push(this.officesSeervice.findOne(officeId));
    });
    await Promise.all(searchesPromises);
    try {
      createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);
      return this.userModel.create(createUserDto);
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    const { limit = 10, page = 1 } = paginationDto;
    const skip = (page - 1) * limit;
    /*const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments()
    ]);
    if (!users.length) {
      throw new NotFoundException('No users found');
    }
    return {
      data: users,
      totalPages: Math.ceil(total / limit)
    }*/
    return this.userModel.find().skip(skip).limit(limit).lean().exec();
    //Mirar este metodo que se puede optimizar y no subcribirse a dos promesas!!!!
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    { password, offices, ...restUser }: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = this.userModel
        .findByIdAndUpdate(id, restUser, { new: true })
        .lean()
        .exec();
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handelDBException(error);
    }
  }

  async addOffice(id: string, officeId: string): Promise<User> {
    const [user, office] = await Promise.all([
      this.userModel.findById(id).exec(),
      this.officesSeervice.findOne(officeId),
    ]);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    user.offices.push(office);
    return user.save();
  }

  private handelDBException(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException(
        `User already exists, ${JSON.stringify(error.keyValue)}`,
      );
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
