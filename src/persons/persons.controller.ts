import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { SearchCriteriaDto } from './dto/search-criteria.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { ParseUtcDatePipe } from '../common/pipes/parse-utc-date.pipe';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@ApiTags('Persons')
@ApiBearerAuth()
@Auth()
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Auth(ValidRoles.admin, ValidRoles.agent)
  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get('office/:officeId')
  findAll(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query('startDate', ParseUtcDatePipe) startDate: string,
    @Query('endDate', ParseUtcDatePipe) endDate: string,
  ) {
    return this.personsService.findAll(officeId, startDate, endDate);
  }

  @Get()
  findByQuery(@Query() searchCriteriaDto: SearchCriteriaDto) {
    return this.personsService.findByQuery(searchCriteriaDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.personsService.findOne(id);
  }

  @Auth(ValidRoles.admin, ValidRoles.agent)
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.manager)
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.personsService.remove(id);
  }
}
