import { Test, TestingModule } from '@nestjs/testing';
import { TourpackageController } from './tourpackage.controller';
import { TourpackageService } from './tourpackage.service';

describe('TourpackageController', () => {
  let controller: TourpackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourpackageController],
      providers: [TourpackageService],
    }).compile();

    controller = module.get<TourpackageController>(TourpackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
