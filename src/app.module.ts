import { ConfigModule } from '@nestjs/config';
import { Tourpackage } from './tourpackage/entities/tourpackage.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TourpackageModule } from './tourpackage/tourpackage.module';
import { AlbumImage } from './tourpackage/entities/albumimage.entity';
import { packageexcluions } from './tourpackage/entities/packageexclsuions.entity';
import { Packageinclusion } from './tourpackage/entities/packageInclusion.entitry';
import { tourpackageplan } from './tourpackage/entities/tourpackageplan.entity';
import { packagehighlight } from './tourpackage/entities/packagehighlight.entity';
import { bookingpolicy } from './tourpackage/entities/bookingpolicy.entity';
import { VisitedPlace } from './tourpackage/entities/visitedplace.entity';
import { Traveller } from './Traveller/entities/traveller.entity';
import { Admin } from './Auth/entities/user.entity';
import { UserModule } from './Auth/user.module';
import { TravellerModule } from './Traveller/traveller.module';
import { UsderProfileModule } from './userProfile/userprofile.module';
import { refundpolicy } from './tourpackage/entities/refundpolicy.entity';
import { MainImage } from './tourpackage/entities/mainimage.entity';
import { S3Module } from './s3/s3.module';
import { Installment } from './tourpackage/entities/installment.entity';
import { BookingModule } from './booking/booking.module';
import { Booking } from './booking/entity/booking.entity';
import { User } from './userProfile/entitties/user.entity';
import { Cheque } from './userProfile/entitties/cheq.entity';
import { Cash } from './userProfile/entitties/cash.entity';
import { BankTransfer } from './userProfile/entitties/BankTransfer.entity';
import { CardPayment } from './userProfile/entitties/Cardpayment.entity';
import { Bkash } from './userProfile/entitties/Bkash.entity';
import { MobileBanking } from './userProfile/entitties/MobileBanking.enity';
import { socialimageenity } from './userProfile/entitties/socialimages.entity';
import { BlogModule } from './blog/blog.module';
import { Blog } from './blog/entities/blog.entity';
import { TestimonialModule } from './testimonial/testimonial.module';
import { Testimonial } from './testimonial/entities/testimonial.entity';
import { PressCoverages } from './blog/entities/press.entity';
import { Payement } from './booking/entity/payement.entity';
import { oauthModule } from './userProfile/oauth.module';
import { AskquestionModule } from './askquestion/askquestion.module';
import { AskQuestion } from './askquestion/Entity/askquestion.entity';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal:true, envFilePath: '.env', }),
    TypeOrmModule.forRoot({
      type:'mysql',
      username:"flyfarin_fflv2",
      password: "123Next2$",
      host: "flyfarint.com",
      database:"flyfarin_fflv2",

      // username:process.env.LOCAL_USERNAME,
      // password: process.env.LOCAL_PASSWORD,
      // host : process.env.LOCAL_HOST,
      // database:process.env.LOCAL_DATABASE,

      port:3306,
      entities: [Admin,
        Payement,
        PressCoverages,
        Testimonial,
        Blog,
        User,
        Cheque,
        Cash,
        BankTransfer,
        CardPayment,
        Bkash,
        MobileBanking,
        Tourpackage,
        MainImage,
        AlbumImage,
        packageexcluions,
        Packageinclusion,
        tourpackageplan,
        packagehighlight,
        bookingpolicy,
        VisitedPlace,
        Traveller,
        refundpolicy,
        Installment,
        Booking,
        socialimageenity,
        AskQuestion
      ],
      synchronize:false
    }),
    UserModule,
    TourpackageModule,
    TravellerModule,
    UsderProfileModule,
    S3Module,
    ConfigModule,
    BookingModule,
    BlogModule,
    TestimonialModule,
    oauthModule,
    AskquestionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
