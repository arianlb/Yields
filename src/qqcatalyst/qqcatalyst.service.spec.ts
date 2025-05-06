import { Test, TestingModule } from '@nestjs/testing';
import { QqcatalystService } from './qqcatalyst.service';

describe('QqcatalystService', () => {
  let service: QqcatalystService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QqcatalystService],
    }).compile();

    service = module.get<QqcatalystService>(QqcatalystService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
