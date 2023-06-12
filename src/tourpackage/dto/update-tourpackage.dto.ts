import { PartialType } from '@nestjs/mapped-types';
import { CreateTourpackageDto } from './create-tourpackage.dto';

export class UpdateTourpackageDto extends PartialType(CreateTourpackageDto) {}
