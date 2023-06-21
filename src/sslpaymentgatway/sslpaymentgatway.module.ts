import { Module } from '@nestjs/common';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';
import { SslpaymentgatwayController } from './sslpaymentgatway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSLCommerzEntity } from './entity';
import { User } from 'src/userProfile/entitties/user.entity';
import { Booking } from 'src/booking/entity/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SSLCommerzEntity, User, Booking])],
  controllers: [SslpaymentgatwayController],
  providers: [SslpaymentgatwayService]
})
export class SslpaymentgatwayModule {}
