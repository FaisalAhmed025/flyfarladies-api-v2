import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ledger } from './entities/ledger.entity';
import { BookingModule } from 'src/booking/booking.module';
import { UserModule } from 'src/Auth/user.module';
import { Booking } from 'src/booking/entity/booking.entity';
import { User } from 'src/userProfile/entitties/user.entity';
import { Cheque } from 'src/userProfile/entitties/cheq.entity';
import { MobileBanking } from 'src/userProfile/entitties/MobileBanking.enity';
import { BankTransfer } from 'src/userProfile/entitties/BankTransfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ledger, Booking, User, Cheque, MobileBanking, BankTransfer]),BookingModule,UserModule],
  controllers: [LedgerController],
  providers: [LedgerService]
})
export class LedgerModule {}
