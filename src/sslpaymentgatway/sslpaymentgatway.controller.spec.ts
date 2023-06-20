import { Test, TestingModule } from '@nestjs/testing';
import { SslpaymentgatwayController } from './sslpaymentgatway.controller';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';

describe('SslpaymentgatwayController', () => {
  let controller: SslpaymentgatwayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SslpaymentgatwayController],
      providers: [SslpaymentgatwayService],
    }).compile();

    controller = module.get<SslpaymentgatwayController>(SslpaymentgatwayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
