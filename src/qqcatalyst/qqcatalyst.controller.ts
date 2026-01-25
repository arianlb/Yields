import { Controller, Get, Query } from '@nestjs/common';
import { QqcatalystService } from './qqcatalyst.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('QQCatalyst')
@ApiBearerAuth()
@Auth()
@Controller('qqcatalyst')
export class QqcatalystController {
  constructor(private readonly qqcatalystService: QqcatalystService) {}

  @Get('/contacts')
  processContacts(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.contactsProcessing(qqDateSearchDto);
  }
  
  @Get('/policies')
  processPolicies(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.policiesProcessing(qqDateSearchDto);
  }
}
