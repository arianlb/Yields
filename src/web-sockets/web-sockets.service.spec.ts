import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketsService } from './web-sockets.service';

describe('WebSocketsService', () => {
  let service: WebSocketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebSocketsService],
    }).compile();

    service = module.get<WebSocketsService>(WebSocketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
