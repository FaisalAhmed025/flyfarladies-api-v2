import { Module } from '@nestjs/common';
import { PresscoverageService } from './presscoverage.service';
import { PresscoverageController } from './presscoverage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PressCoverages } from './entities/presscoverage.entity';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports:[TypeOrmModule.forFeature([PressCoverages]),S3Module],
  controllers: [PresscoverageController],
  providers: [PresscoverageService]
})
export class PresscoverageModule {}
