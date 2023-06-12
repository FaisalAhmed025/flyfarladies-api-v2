import { TravellerController } from './traveller.controller';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Traveller } from "./entities/traveller.entity";
import { TravellerServices } from "./traveller.services";
import { S3Module } from 'src/s3/s3.module';




@Module({
   imports: [TypeOrmModule.forFeature([Traveller]), S3Module],
   controllers:[TravellerController],
   providers:[TravellerServices]

})

export class TravellerModule{}