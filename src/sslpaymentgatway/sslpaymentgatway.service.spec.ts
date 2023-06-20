import { Test, TestingModule } from '@nestjs/testing';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';

describe('SslpaymentgatwayService', () => {
  let service: SslpaymentgatwayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SslpaymentgatwayService],
    }).compile();

    service = module.get<SslpaymentgatwayService>(SslpaymentgatwayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
