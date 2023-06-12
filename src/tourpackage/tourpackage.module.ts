import { S3Module } from './../s3/s3.module';
import { ConfigModule, } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TourpackageService } from './tourpackage.service';
import { TourpackageController } from './tourpackage.controller';
import { Tourpackage } from './entities/tourpackage.entity';
import { AlbumImage } from './entities/albumimage.entity';
import { VisitedPlace } from './entities/visitedplace.entity';
import { Packageinclusion } from './entities/packageInclusion.entitry';
import { tourpackageplan } from './entities/tourpackageplan.entity';
import { packageexcluions } from './entities/packageexclsuions.entity';
import { packagehighlight } from './entities/packagehighlight.entity';
import { bookingpolicy } from './entities/bookingpolicy.entity';
import { refundpolicy } from './entities/refundpolicy.entity';
import { MainImage } from './entities/mainimage.entity';
import { Installment } from './entities/installment.entity';
import { Traveller } from 'src/Traveller/entities/traveller.entity';
import { TravellerModule } from 'src/Traveller/traveller.module';


@Module({
  imports:[
    S3Module,
    TravellerModule,
    TypeOrmModule.forFeature([
    Traveller,
    Tourpackage,
    MainImage,
    AlbumImage,
    VisitedPlace,
    Packageinclusion,
    tourpackageplan,
    packageexcluions,
    packagehighlight,
    bookingpolicy,
    Tourpackage,
    refundpolicy,
    Installment
  ])],
  controllers: [TourpackageController],
  providers: [TourpackageService],
  exports:[TourpackageService]
})
export class TourpackageModule {}
