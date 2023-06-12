import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from 'src/s3/s3.module';
import { Blog } from './entities/blog.entity';
import { User } from 'src/userProfile/entitties/user.entity';
import { PressCoverages } from './entities/press.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Blog, User,PressCoverages]),S3Module],
  controllers: [BlogController],
  providers: [BlogService]
})
export class BlogModule {}
