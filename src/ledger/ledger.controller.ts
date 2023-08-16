import { BookingStatus } from './../booking/entity/booking.entity';
import { Booking } from 'src/booking/entity/booking.entity';
import { Ledger } from 'src/ledger/entities/ledger.entity';
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from 'src/userProfile/entitties/user.entity';
import { Cheque, PaymentStatus } from 'src/userProfile/entitties/cheq.entity';
import { MobileBanking } from 'src/userProfile/entitties/MobileBanking.enity';
import { BankTransfer } from 'src/userProfile/entitties/BankTransfer.entity';

@Controller('ledger')
export class LedgerController {
  constructor( 
    @InjectRepository(Booking) private bookingRepository:Repository <Booking>,
    @InjectRepository(Cheque) private chequeRepository:Repository <Cheque>,
    @InjectRepository(User) private userRepository:Repository <User>,
    @InjectRepository(MobileBanking) private MobileBankingRepository:Repository <MobileBanking>,
    @InjectRepository(BankTransfer) private BankTransferRepository:Repository <BankTransfer>,
    private readonly ledgerService: LedgerService) {}
    
@Get(':uuid/userledger') 
 async Ledger(
  @Param('uuid') uuid:string) {
  const booking = await this.bookingRepository.find({
    where: {
      userid:uuid,
      status: BookingStatus.CONFIRMED
    },
    order: {
      CreatedAt: 'DESC',
      
    },
  });
  if (!booking) {
    throw new HttpException(
      `User not found`,
      HttpStatus.BAD_REQUEST,
    );
  }

  const chequeDeposits = await this.chequeRepository.find({
    where: {
      uuid:uuid,
      status:PaymentStatus.APPROVED
    },
    order: {
      CreatedAt: 'DESC',
    },
  });

  const mobileBankings = await this.MobileBankingRepository.find({
    where: {
      uuid:uuid,
      status:PaymentStatus.APPROVED
    },
    order: {
     CreatedAt: 'DESC',
    },
  });

  const bankTransfers = await this.BankTransferRepository.find({
    where: {
      uuid:uuid,
      status:PaymentStatus.APPROVED
 
    },
    order: {
      CreatedAt: 'DESC',
    },
  });

  const ledger = {
    chequeDeposits,
    mobileBankings,
    bankTransfers,
    booking

  }
  if (!ledger || Object.keys(ledger).every((key) => ledger[key].length === 0)) {
    throw new HttpException(`No ledger found`, HttpStatus.BAD_REQUEST);
  }

  const sortedLedger = Object.keys(ledger).reduce((acc, key) => {
    return [...acc, ...ledger[key]];
  }, []).sort((a, b) => b.CreatedAt.getTime() - a.CreatedAt.getTime());
  return sortedLedger;
  



  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ledgerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLedgerDto: UpdateLedgerDto) {
    return this.ledgerService.update(+id, updateLedgerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ledgerService.remove(+id);
  }
}
