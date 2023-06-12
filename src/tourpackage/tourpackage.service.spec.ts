import { Test, TestingModule } from '@nestjs/testing';
import { TourpackageService } from './tourpackage.service';

describe('TourpackageService', () => {
  let service: TourpackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TourpackageService],
    }).compile();

    service = module.get<TourpackageService>(TourpackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
