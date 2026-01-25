import { Controller, Get, Query } from '@nestjs/common';
import { QqcatalystService } from './qqcatalyst.service';
import { ApiTags } from '@nestjs/swagger';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
// import { CreateQqcatalystDto } from './dto/create-qqcatalyst.dto';
// import { UpdateQqcatalystDto } from './dto/update-qqcatalyst.dto';

@ApiTags('QQCatalyst')
@Controller('qqcatalyst')
export class QqcatalystController {
  constructor(private readonly qqcatalystService: QqcatalystService) {}

  @Get()
  processContacts(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.contactsProcessing(qqDateSearchDto);
  }
  
  @Get()
  processPolicies(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.policiesProcessing(qqDateSearchDto);
  }
}
