import { Test, TestingModule } from '@nestjs/testing';
import { PresscoverageController } from './presscoverage.controller';
import { PresscoverageService } from './presscoverage.service';

describe('PresscoverageController', () => {
  let controller: PresscoverageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresscoverageController],
      providers: [PresscoverageService],
    }).compile();

    controller = module.get<PresscoverageController>(PresscoverageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
