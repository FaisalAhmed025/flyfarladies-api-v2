import { PartialType } from '@nestjs/mapped-types';
import { CreateInstallmentDto } from './create-installment.dto';


export class updateinstallmentdto extends PartialType(CreateInstallmentDto){}