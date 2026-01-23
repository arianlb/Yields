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
import { DateSearchDto } from '../common/dto/date-search.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { AssignPoliciesDto } from './dto/assign-policies.dto';

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
    @Query() dateSearchDto: DateSearchDto,
  ) {
    return this.policiesService.findByExpirationDate(officeId, dateSearchDto);
  }

  @Get('cancellation-date/:officeId')
  findByCancellationDate(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Query() dateSearchDto: DateSearchDto,
  ) {
    return this.policiesService.findByCancellationDate(officeId, dateSearchDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.policiesService.findOne(id);
  }

  @Get(':officeId/policy-number/:policyNumber')
  findByPolicyNumber(
    @Param('officeId', ParseMongoIdPipe) officeId: string,
    @Param('policyNumber') policyNumber: string,
  ) {
    return this.policiesService.findByPolicyNumber(officeId, policyNumber);
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
