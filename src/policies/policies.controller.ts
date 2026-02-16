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
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { ParseUtcDatePipe } from '../common/pipes/parse-utc-date.pipe';
import { Auth } from '../auth/decorators/auth.decorator';
import { AssignPoliciesDto } from './dto/assign-policies.dto';
import { PolicySearchCriteriaDto } from './dto/policy-search-criteria.dto';

@ApiTags('Policies')
@ApiBearerAuth()
@Auth()
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
  }

  @Get('expiration-date/:officeId')
  findByExpirationDate(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query('startDate', ParseUtcDatePipe) startDate: string,
    @Query('endDate', ParseUtcDatePipe) endDate: string,
  ) {
    return this.policiesService.findByExpirationDate(
      officeId,
      startDate,
      endDate,
    );
  }

  @Get('cancellation-date/:officeId')
  findByCancellationDate(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query('startDate', ParseUtcDatePipe) startDate: string,
    @Query('endDate', ParseUtcDatePipe) endDate: string,
  ) {
    return this.policiesService.findByCancellationDate(
      officeId,
      startDate,
      endDate,
    );
  }
  
  @Get('dashboard/:officeId')
  findDashboardData(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query('startDate', ParseUtcDatePipe) startDate: string,
    @Query('endDate', ParseUtcDatePipe) endDate: string,
  ) {
    return this.policiesService.findDashboardData(
      officeId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.policiesService.findOne(id);
  }

  @Get()
  findByQuery(@Query() policySearchCriteriaDto: PolicySearchCriteriaDto) {
    return this.policiesService.findByQuery(policySearchCriteriaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ) {
    return this.policiesService.update(id, updatePolicyDto);
  }

  @Post('assign-policies')
  assignPoliciesToAgent(@Body() assignPoliciesDto: AssignPoliciesDto) {
    return this.policiesService.assignPoliciesToAgent(assignPoliciesDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.policiesService.remove(id);
  }
}
