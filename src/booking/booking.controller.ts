
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

  @Post(':Id/book/:uuid')
  async addbooking(
    @Body() bookingDto: CreateBookingDto,
    @Param('Id') Id: string,
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.BookTravelpackage(Id, bookingDto, uuid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'booking sucessfull',});
  }


  @Post(':bookingId/confirm-with-installment')
  async confirmBookingWithInstallment(
    @Param('Bookingid') Bookingid: string,
    @Param('uuid') uuid: string,
    @Body('installmentId') installmentId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.confirmBookingWithInstallment(Bookingid,installmentId,uuid);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Payment Successfull' });
  }

  @Patch(':Bookingid/confirmed')
  async confirmedbooking(
    @Param('Bookingid') Bookingid: string,
    @Body('uuid') uuid: string,
    Email: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.MakePayementwithwallet(Bookingid, uuid, Email);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Payment Successfull' });
  }


  @Patch(':Bookingid/approved')
  async ApprovedAdmin(
    @Param('Bookingid') Bookingid: string,
    @Body('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.ApprvedAdmin(Bookingid, uuid, req.body);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Booking Confirmed' });
  }

  
  @Patch(':Bookingid/cancelled/admin')
  async RejectdAdmin(
    @Param('Bookingid') Bookingid: string,
    @Body('uuid') uuid: string,
    @Body('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.Cancelledbookingbyadmin(Bookingid,uuid,Id,req.body);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Booking Cancelled' });
  }

  
  @Patch(':Bookingid/cancelled')
  async cancelbyuser(
    @Param('Bookingid') Bookingid: string,
    @Body('uuid') uuid: string,
    @Body('Id') Id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.bookingService.Cancelledbookingbyuser(Bookingid,uuid,Id,req.body,);
    return res
      .status(HttpStatus.OK)
      .send({ status: 'success', message: 'Booking Cancelled,please wait for refund' });
  }

  @Get(':Bookingid')
  async getBooking(@Param('Bookingid') Bookingid: string) {
    return await this.bookingService.getBooking(Bookingid);
  }

  @Get(':userid/getall/mybookings')
  async MyAllBookings(@Param('userid') userid: string) {
    const bookings = await this.bookingRepository.find({
      where: { userid },
      relations: [
        'tourPackage',
        'tourPackage.vistitedImages',
        'tourPackage.PackageInclusions',
        'tourPackage.highlights',
        'tourPackage.refundpolicys',
        'tourPackage.installments',
        'travelers'
      ],
      order: { CreatedAt: 'DESC' },
    });
    
    if (bookings.length === 0) {
      throw new NotFoundException('You do not have any bookings');
    }
  
    return bookings;
  }
  
  // @Get(':userid/getall/mybookings')
  // async MyAllBookings(@Param('userid') userid: string) {
  //   const user = await this.bookingRepository.findOne({ where: { userid } });
  //   const joinAliases = [
  //     { property: 'tourPackage', alias: 'tourPackage' },
  //     { property: 'tourPackage.vistitedImages', alias: 'vistitedImages' },
  //     // { property: 'tourPackage.exclusions', alias: 'exclusions' },
  //     { property: 'tourPackage.PackageInclusions', alias: 'packageInclusions' },
  //     // { property: 'tourPackage.BookingPolicys', alias: 'bookingPolicys' },
  //     { property: 'tourPackage.highlights', alias: 'highlights' },
  //     { property: 'tourPackage.refundpolicys', alias: 'refundPolicys' },
  //     // { property: 'tourPackage.tourpackageplans', alias: 'tourPackagePlans' },
  //     { property: 'tourPackage.installments', alias: 'installments' },
  //     { property: 'booking.travelers', alias: 'travelers' },
  //     // Add more join aliases here
  //   ];

  //   const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

  //   for (const { property, alias } of joinAliases) {
  //     if (property !== 'tourPackage') {
  //       queryBuilder.leftJoinAndSelect(property, alias);
  //     } else {
  //       queryBuilder.leftJoinAndSelect('booking.tourPackage', alias);
  //     }
  //   }
  //   const bookedPackages = await queryBuilder
  //     .where('booking.userid = :userid', { userid })
  //     .orderBy('booking.CreatedAt', 'DESC')
  //     .getMany();
  //   if (!bookedPackages) {
  //     throw new NotFoundException('You dont have any booking');
  //   }

  //   return { bookedPackages: bookedPackages };
  // }

  @Get('getall/booking')
  async getALlBooking(@Res() res: Response) {
    const bookings = await this.bookingService.FindAll();
    return res.status(HttpStatus.OK).json({ bookings });
  }
}



