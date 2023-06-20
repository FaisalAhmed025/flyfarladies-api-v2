import { Module } from '@nestjs/common';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';
import { SslpaymentgatwayController } from './sslpaymentgatway.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SSLCommerzEntity } from './entity';

@Module({
  imports: [TypeOrmModule.forFeature([SSLCommerzEntity])],
  controllers: [SslpaymentgatwayController],
  providers: [SslpaymentgatwayService]
})
export class SslpaymentgatwayModule {}
