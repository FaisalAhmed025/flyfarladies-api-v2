import { PartialType } from '@nestjs/mapped-types';
import { CreateTravellerDto } from './create-traveller.dto';

export class updateTravellerDto extends PartialType(CreateTravellerDto){}