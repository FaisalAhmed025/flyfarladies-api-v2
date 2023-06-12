import { Type } from 'class-transformer';
import { CreateTravellerDto } from './../../Traveller/Dto/create-traveller.dto';

import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  bookingId: string;
  userid:string

  @IsNotEmpty()
  @IsNumber()
  Id: number;

  @IsNotEmpty()
  @IsArray()
  @IsString()
  @Type(()=>CreateTravellerDto)
  travelers: CreateTravellerDto[];
  Price:number
}