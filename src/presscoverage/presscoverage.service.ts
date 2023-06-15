import { Injectable } from '@nestjs/common';
import { CreatePresscoverageDto } from './dto/create-presscoverage.dto';
import { UpdatePresscoverageDto } from './dto/update-presscoverage.dto';

@Injectable()
export class PresscoverageService {
  create(createPresscoverageDto: CreatePresscoverageDto) {
    return 'This action adds a new presscoverage';
  }

  findAll() {
    return `This action returns all presscoverage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} presscoverage`;
  }

  update(id: number, updatePresscoverageDto: UpdatePresscoverageDto) {
    return `This action updates a #${id} presscoverage`;
  }

  remove(id: number) {
    return `This action removes a #${id} presscoverage`;
  }
}
