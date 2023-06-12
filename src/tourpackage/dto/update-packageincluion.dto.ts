import { createpackageincluionDto } from './create-packageInclusion.dto';
import { PartialType } from '@nestjs/mapped-types';



export class updatepackageInclusionDto extends PartialType(createpackageincluionDto){}