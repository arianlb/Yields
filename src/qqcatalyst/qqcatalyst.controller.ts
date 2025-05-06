import { Controller, Get } from '@nestjs/common';
import { QqcatalystService } from './qqcatalyst.service';
import { ApiTags } from '@nestjs/swagger';
// import { CreateQqcatalystDto } from './dto/create-qqcatalyst.dto';
// import { UpdateQqcatalystDto } from './dto/update-qqcatalyst.dto';

@ApiTags('QQCatalyst')
@Controller('qqcatalyst')
export class QqcatalystController {
  constructor(private readonly qqcatalystService: QqcatalystService) {}

  @Get()
  getAccessToken() {
    return this.qqcatalystService.getUserData();
  }

}
