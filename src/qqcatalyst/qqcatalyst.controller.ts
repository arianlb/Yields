import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QqcatalystService } from './qqcatalyst.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
import { PolicyNumbersDto } from './dto/policy-numbers.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('QQCatalyst')
@ApiBearerAuth()
@Controller('qqcatalyst')
export class QqcatalystController {
  constructor(private readonly qqcatalystService: QqcatalystService) {}

  @Auth()
  @Get('/contacts')
  processContacts(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.contactsProcessing(qqDateSearchDto);
  }

  @Auth()
  @Get('/policies')
  processPolicies(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystService.policiesProcessing(qqDateSearchDto);
  }

  @Post('/policies/manual')
  insertPolicyManually(@Body() policyNumbersDto: PolicyNumbersDto) {
    return this.qqcatalystService.insertPolicyManually(policyNumbersDto);
  }
}
