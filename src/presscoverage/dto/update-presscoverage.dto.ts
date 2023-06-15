import { PartialType } from '@nestjs/swagger';
import { CreatePresscoverageDto } from './create-presscoverage.dto';

export class UpdatePresscoverageDto extends PartialType(CreatePresscoverageDto) {}
