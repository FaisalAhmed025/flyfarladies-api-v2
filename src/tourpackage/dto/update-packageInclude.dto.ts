import { createPackageIncludeDto } from './crteate-packageInlcude.dto';
import { PartialType } from '@nestjs/mapped-types';


export  class UpdateTourpackageIncludedDto extends PartialType(createPackageIncludeDto){}