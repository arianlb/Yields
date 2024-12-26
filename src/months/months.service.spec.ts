import { Test, TestingModule } from '@nestjs/testing';
import { MonthsService } from './months.service';

describe('MonthsService', () => {
  let service: MonthsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthsService],
    }).compile();

    service = module.get<MonthsService>(MonthsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
