import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Users')
@ApiBearerAuth()
@Auth(ValidRoles.admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('office/:officeId')
  findAll(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.findAll(officeId, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}
