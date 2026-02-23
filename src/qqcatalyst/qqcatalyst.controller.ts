import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { QqcatalystService } from './qqcatalyst.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QqDateSearchDto } from './dto/qq-date-search.dto';
import { PolicyNumbersDto } from './dto/policy-numbers.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('QQCatalyst')
@ApiBearerAuth()
@Controller('qqcatalyst')
export class QqcatalystController {
  constructor(
    @Inject('SEBANDA_89')
    private readonly qqcatalystService: QqcatalystService,
    @Inject('SEBANDA_117')
    private readonly qqcatalystServiceB: QqcatalystService,
  ) {}

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
  
  @Auth()
  @Get('/contacts-b')
  processContactsB(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystServiceB.contactsProcessing(qqDateSearchDto);
  }

  @Auth()
  @Get('/policies-b')
  processPoliciesB(@Query() qqDateSearchDto: QqDateSearchDto) {
    return this.qqcatalystServiceB.policiesProcessing(qqDateSearchDto);
  }

  @Post('/policies/manual-b')
  insertPolicyManuallyB(@Body() policyNumbersDto: PolicyNumbersDto) {
    return this.qqcatalystServiceB.insertPolicyManually(policyNumbersDto);
  }
}
