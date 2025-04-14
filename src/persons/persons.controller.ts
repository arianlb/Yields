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
import { ApiTags } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { SearchCriteriaDto } from './dto/search-criteria.dto';
import { DateSearchDto } from '../common/dto/date-search.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Persons')
@Auth()
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  @Get('office/:officeId')
  findAll(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query() dateSearchDto: DateSearchDto,
  ) {
    return this.personsService.findAll(officeId, dateSearchDto);
  }

  @Get()
  findByQuery(@Query() searchCriteriaDto: SearchCriteriaDto) {
    return this.personsService.findByQuery(searchCriteriaDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.personsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.personsService.update(id, updatePersonDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.personsService.remove(id);
  }
}
