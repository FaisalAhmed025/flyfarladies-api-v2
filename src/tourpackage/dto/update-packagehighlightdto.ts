import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageHighlightDto } from './create-packagehighlights.dto';

export class UpdatepackageHighlightDto extends PartialType(
  CreatePackageHighlightDto,
) {}
