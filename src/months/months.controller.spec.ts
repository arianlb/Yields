import { Test, TestingModule } from '@nestjs/testing';
import { MonthsController } from './months.controller';
import { MonthsService } from './months.service';

describe('MonthsController', () => {
  let controller: MonthsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthsController],
      providers: [MonthsService],
    }).compile();

    controller = module.get<MonthsController>(MonthsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
