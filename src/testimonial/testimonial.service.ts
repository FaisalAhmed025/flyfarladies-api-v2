import { Injectable } from '@nestjs/common';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';

@Injectable()
export class TestimonialService {
  constructor(  @InjectRepository(Testimonial) private TestimonialRepository: Repository<Testimonial>,){}

  findAll() {
    return `This action returns all testimonial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testimonial`;
  }

 async update(id: string, updateTestimonialDto: UpdateTestimonialDto) {
    return await this.TestimonialRepository.update(id, updateTestimonialDto);
  }

async remove(id: string) {
    return  this.TestimonialRepository.delete(id);
  }
}
