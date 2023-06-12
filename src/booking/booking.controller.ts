
import { Body, HttpStatus, Post, Req, Res, Patch, NotFoundException } from '@nestjs/common';
import { Controller, Get, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request, Response } from 'express';
import { CreateBookingDto } from './dto/booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entity/booking.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Booking Module')
@Controller('booking')
export class BookingController {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly bookingService: BookingService,
  ) {}

  @Post(':Id/addbooking')
  async addbooking(
    @Body() bookingDto: CreateBookingDto,
    @Param('Id') Id: string,
    uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.BookTravelpackage(Id, bookingDto, uuid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Booking sucessfull' });
  }
  @Post(':bookingId/confirm-with-installment')
  async confirmBookingWithInstallment(
    @Param('Bookingid') Bookingid: string,
    uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.confirmBookingWithInstallment(Bookingid, uuid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Payment Successfull sucessfull' });
  }

  @Patch(':Bookingid/confirmed')
  async Approvedbooking(
    @Param('Bookingid') Bookingid: string,
    @Body('uuid') uuid: string,
    Email: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.MakePayementwithwallet(Bookingid, uuid, Email);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Booking Confirmed' });
  }

  @Get(':Bookingid')
  async getBooking(@Param('Bookingid') Bookingid: string) {
    return await this.bookingService.getBooking(Bookingid);
  }

  @Get(':userid/getall/mybookings')
  async MyAllBookings(@Param('userid') userid: string) {
    const user = await this.bookingRepository.findOne({ where: { userid } });
    const joinAliases = [
      { property: 'tourPackage', alias: 'tourPackage' },
      { property: 'tourPackage.vistitedImages', alias: 'vistitedImages' },
      { property: 'tourPackage.exclusions', alias: 'exclusions' },
      { property: 'tourPackage.PackageInclusions', alias: 'packageInclusions' },
      { property: 'tourPackage.BookingPolicys', alias: 'bookingPolicys' },
      { property: 'tourPackage.highlights', alias: 'highlights' },
      { property: 'tourPackage.refundpolicys', alias: 'refundPolicys' },
      { property: 'tourPackage.tourpackageplans', alias: 'tourPackagePlans' },
      { property: 'tourPackage.installments', alias: 'installments' },
      { property: 'booking.travelers', alias: 'travelers' },
      // Add more join aliases here
    ];

    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

    for (const { property, alias } of joinAliases) {
      if (property !== 'tourPackage') {
        queryBuilder.leftJoinAndSelect(property, alias);
      } else {
        queryBuilder.leftJoinAndSelect('booking.tourPackage', alias);
      }
    }

    const bookedPackages = await queryBuilder
      .where('booking.userid = :userid', { userid })
      .getMany();
    if (!bookedPackages) {
      throw new NotFoundException('You dont have any booking');
    }

    return { bookedPackages: bookedPackages };
  }

  @Get('getall/booking')
  async getALlBooking(@Res() res: Response) {
    const bookings = await this.bookingService.FindAll();
    return res.status(HttpStatus.OK).json({ bookings });
  }
}



