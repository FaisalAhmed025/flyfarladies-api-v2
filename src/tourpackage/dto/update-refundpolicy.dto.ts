import { createRefundPolicyDto } from './create-refundpolicy.dto';
import { PartialType } from '@nestjs/mapped-types';
export class UpdateRefundPolicy extends PartialType(createRefundPolicyDto) { }