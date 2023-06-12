import { PartialType } from '@nestjs/mapped-types';
import { CreatepackageExclsuionsDto } from './create-packageexclusions.dto';


export class updatepackageExclusionsDto extends PartialType(CreatepackageExclsuionsDto){}