import { CreateTourPackagePlanDto } from './create-packagetourplan.dto';
import { PartialType } from '@nestjs/mapped-types';

export class updateTourPackagePlanDto extends PartialType(
  CreateTourPackagePlanDto,
) {}
