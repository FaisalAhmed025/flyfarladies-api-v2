import { Controller } from '@nestjs/common';
import { GCSStorageService } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: GCSStorageService) {}
}
