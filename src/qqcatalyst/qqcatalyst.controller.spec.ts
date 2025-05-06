import { Test, TestingModule } from '@nestjs/testing';
import { QqcatalystController } from './qqcatalyst.controller';
import { QqcatalystService } from './qqcatalyst.service';

describe('QqcatalystController', () => {
  let controller: QqcatalystController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QqcatalystController],
      providers: [QqcatalystService],
    }).compile();

    controller = module.get<QqcatalystController>(QqcatalystController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
