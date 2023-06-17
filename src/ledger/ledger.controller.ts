import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entity/booking.entity';
import { Repository } from 'typeorm';
import { User } from 'src/userProfile/entitties/user.entity';

@Controller('ledger')
export class LedgerController {
  constructor( 
    @InjectRepository(Booking) private bookingRepository:Repository <Booking>,
    @InjectRepository(User) private userRepository:Repository <User>,
    private readonly ledgerService: LedgerService) {}

  @Get('all')
  async findAll() {
    const booking = await this.bookingRepository.find({})
    
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
