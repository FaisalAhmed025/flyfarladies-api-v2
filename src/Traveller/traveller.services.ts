
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { updateTravellerDto } from './Dto/update-traveller.dto';
import { Traveller } from './entities/traveller.entity';



@Injectable()
export class TravellerServices {
   constructor(@InjectRepository(Traveller) private tarvellerRepository: Repository<Traveller>) { }

   // get All User
   async FindAllTraveller() {
      const traveller = await this.tarvellerRepository.find({});
      return traveller;
   }

   // find user by Id
   async FindTrveller(TravellerId: string): Promise<Traveller> {
      const traveller = await this.tarvellerRepository.findOne({ where: { TravellerId } });
      if (!traveller) {
         throw new HttpException("traveller not found", HttpStatus.BAD_REQUEST);
      }
      return traveller;
   }

   // update user
   async UpdateTravller(TravellerId: string, updatetravellerdto: updateTravellerDto) {

      const traveller = await this.tarvellerRepository.findOne({where:{TravellerId}})
      if(!traveller){
         throw new HttpException("traveller not found", HttpStatus.BAD_REQUEST);
      }

      const updatedtraveller = await this.tarvellerRepository.update({ TravellerId },{ ...updatetravellerdto})
      return updatedtraveller;
   }
   // Delte User
   async DeleteTraveller(TravellerId: string) {
      const traveller = await this.tarvellerRepository.findOne({ where: { TravellerId } });
      if (!traveller) {
         throw new HttpException("traveller not found", HttpStatus.BAD_REQUEST);
      }
      const deletetraveller = await this.tarvellerRepository.delete(TravellerId)
      return deletetraveller;
   }
}