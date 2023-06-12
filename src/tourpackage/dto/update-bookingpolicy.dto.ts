import { CreateBookingPolicyDto } from './creat-bookingpolicy.dto';
import { PartialType } from '@nestjs/mapped-types';


export class updateBookingPolicyDto extends PartialType(CreateBookingPolicyDto) { }