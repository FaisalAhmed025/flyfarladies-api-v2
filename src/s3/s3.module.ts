
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { S3Controller } from './s3.controller';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { AlbumImage } from 'src/tourpackage/entities/albumimage.entity';
import { MainImage } from 'src/tourpackage/entities/mainimage.entity';
import { VisitedPlace } from 'src/tourpackage/entities/visitedplace.entity';
import { User } from 'src/userProfile/entitties/user.entity';
import { Blog } from 'src/blog/entities/blog.entity';
import { Testimonial } from 'src/testimonial/entities/testimonial.entity';
import { GCSStorageService } from './s3.service';


@Module({
  imports: [
  TypeOrmModule.forFeature([Tourpackage, AlbumImage, MainImage, VisitedPlace, User, Blog, Testimonial])],
  controllers: [S3Controller],
  providers: [GCSStorageService],
  exports:[GCSStorageService]
})
export class S3Module {}
