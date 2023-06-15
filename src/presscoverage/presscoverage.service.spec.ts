import { Test, TestingModule } from '@nestjs/testing';
import { PresscoverageService } from './presscoverage.service';

describe('PresscoverageService', () => {
  let service: PresscoverageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresscoverageService],
    }).compile();

    service = module.get<PresscoverageService>(PresscoverageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
