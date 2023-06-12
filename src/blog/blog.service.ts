import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(  @InjectRepository(Blog) private BlogRepo: Repository<Blog>,){}
  create(createBlogDto: CreateBlogDto) {
    return 'This action adds a new blog';
  }

  async findAll() {
    return await this.BlogRepo.find({});
  }

  findOne(id: number) {
    return ;
  }

 async update(id: string, updateBlogDto: UpdateBlogDto) {
    return  await this.BlogRepo.update(id,{...updateBlogDto});
  }

 async remove(id: string) {
    return await this.BlogRepo.delete(id);
  }
}
