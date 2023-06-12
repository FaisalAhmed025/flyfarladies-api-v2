import { Test, TestingModule } from '@nestjs/testing';
import { GCSStorageService } from './s3.service';

describe('S3Service', () => {
  let service: GCSStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GCSStorageService],
    }).compile();

    service = module.get<GCSStorageService>(GCSStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
