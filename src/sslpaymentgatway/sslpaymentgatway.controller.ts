import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Redirect, Req, Res } from '@nestjs/common';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { SSLCommerzEntity, SSLpaymentStatus } from './entity';
import { Repository } from 'typeorm';
const SSLCommerzPayment = require('sslcommerz-lts')
import { createHash } from 'crypto';
import { Booking, BookingStatus } from 'src/booking/entity/booking.entity';
import { User } from 'src/userProfile/entitties/user.entity';


@Controller('sslpaymentgatway')
export class SslpaymentgatwayController {
  constructor(
    @InjectRepository(SSLCommerzEntity) private sslcommerzRepository:Repository<SSLCommerzEntity>,
    @InjectRepository(Booking) private BookingRepository:Repository<Booking>,
    @InjectRepository(User) private UserRepository:Repository<User>,
     private readonly sslpaymentgatwayService: SslpaymentgatwayService) {}

 generateCustomTransactionId(): string {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substr(2, 6); // Generate a random alphanumeric string
    const hash = createHash('sha256').update(`${timestamp}${randomString}`).digest('hex');
    const shortenedHash = hash.substr(0, 16).toUpperCase();
    return shortenedHash;
  }

  @Post('initiate/uuid/:uuid/bokingid/:Bookingid')
  async init(
  @Param('uuid') uuid:string,
  @Param('Bookingid') Bookingid:string,
  @Req() req: Request): Promise<{  checkoutpageurl?: string }> {

    const booking = await this.BookingRepository.findOne({where:{Bookingid}})
    if (!booking) {
      throw new HttpException('you dont have any booking with this id', HttpStatus.BAD_REQUEST);
    }
    const user = await this.UserRepository.findOne({where:{uuid}})
    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }
    const transactionId = this.generateCustomTransactionId();

    const data ={ 
    store_id: process.env.SSL_STORE_ID,
    store_passwd: process.env.SSL_STORE_PASSWORD,
    total_amount:booking.TotalPrice ,
    currency: "BDT",
    tran_id: transactionId,
    tran_date:Date(),
    success_url: `http://localhost:5000/sslpaymentgatway/success/${transactionId}`,
    fail_url:   ` http://localhost:5000/sslpaymentgatway/failure/${transactionId}`,
    cancel_url: `http://localhost:5000/sslpaymentgatway/cancel/${transactionId}`,
    emi_option: 0,
    cus_name: user.Name,
    cus_email: user.Email,
    cus_phone: "0123456789",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: "Sample Product",
    product_category: "Sample Category",
    product_profile: "general",
    value_a:user.uuid,
    value_b:booking.Bookingid
  }
    try {
   
      const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID,  process.env.SSL_STORE_PASSWORD, false);
      const apiResponse = await sslcz.init(data);
      const gatewayPageURL = apiResponse.GatewayPageURL
      await this.sslcommerzRepository.save(data)
      return {checkoutpageurl:gatewayPageURL};
    } catch (error) {
      throw new Error('Failed to initiate payment');
    }
  }
  
  @Post('success/:tran_id')
async create(
  @Body() data: any,
  @Param('tran_id') tran_id: string,
  @Req() req: Request,
  @Res() res: Response

): Promise<any> {
  try {
    const transaction = await this.sslcommerzRepository.findOne({where:{tran_id}});
    if (!transaction) {
      return { message: 'Transaction ID not found', error: true };
    }
    transaction.paymentstatus = SSLpaymentStatus.VALIDATED;
    transaction.store_amount = data.store_amount
    transaction.tran_date = data.tran_date
    transaction.val_id = data.val_id
    transaction.bank_tran_id = data.bank_tran_id
    await this.sslcommerzRepository.save(transaction);
    if(transaction.paymentstatus === SSLpaymentStatus.VALIDATED){
     const message ='payment successfull'
     const status ='success'
     res.redirect(`https://flyfarladies.com/dashboard/profile?message=${encodeURIComponent(message)}&status=${encodeURIComponent(status)}`)
    }

  } catch (error) {
    console.error('Error processing payment callback:', error);
    return { message: 'Error processing payment callback', error: true };
  }
}

@Post('failure/:tran_id')
async failtransaction(
  @Body() data: any,
  @Param('tran_id') tran_id: string,
  @Req() req: Request
): Promise<any> {
   await this.sslcommerzRepository.delete({tran_id});
   return { message: 'Transaction failed'};

}


@Post('cancel/:tran_id')
async CancellTransaction(
  @Body() data: any,
  @Param('tran_id') tran_id: string,
  @Req() req: Request
): Promise<any> {
   await this.sslcommerzRepository.delete({tran_id});
   return { message: 'Transaction Cancelled'};
}
  


@Get('/validate/:val_id')
async validate(@Param('val_id') val_id: string, @Req() req: Request): Promise<any> {
  const data={
    val_id: val_id
  }
  const sslcz = new SSLCommerzPayment(process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD,false);
  const validationData = await sslcz.validate(data);
  return validationData;
}
  

  @Post('/initiate-refund')
  async initiateRefund(
    @Body('refund_amount') refund_amount: number,
    @Body('refund_remarks') refund_remarks: string,
    @Body('bank_tran_id') bank_tran_id: string,
    @Body('refe_id') refe_id: string,) {
    const data = {
      refund_amount:refund_amount,
      refund_remarks:refund_remarks,
      bank_tran_id:bank_tran_id,
      refe_id:refe_id,
  };
    const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD, false);
    try {
      const response = await sslcz.initiateRefund(data);

      // Process the response received from SSLCommerz
      // Refer to the documentation for available response fields:
      // https://developer.sslcommerz.com/doc/v4/#initiate-the-refund

      return response;
    } catch (error) {
      // Handle any errors that occur during the refund initiation
      console.error(error);
      throw new HttpException('Error initiating refund', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  @Get('/refund-query/:refund_ref_id')
  async refundQuery(@Param('refund_ref_id') refund_ref_id: string) {
    const data = {
      refund_ref_id: refund_ref_id,
    };
    const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID,  process.env.SSL_STORE_PASSWORD, false);
    try {
      const response = await sslcz.refundQuery(data);
      // Process the response received from SSLCommerz
      // Refer to the documentation for available response fields:
      // https://developer.sslcommerz.com/doc/v4/#initiate-the-refund
      return response;
    } catch (error) {
      // Handle any errors that occur during the refund query
      console.error(error);
      throw new HttpException('Error querying refund', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/transaction-query-by-transaction-id/:trans_id')
  async transactionQueryByTransactionId(@Param('trans_id') trans_id: string) {
    const data = {
      tran_id: trans_id,
    };
    const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID,  process.env.SSL_STORE_PASSWORD, false);
    try {
      const response = await sslcz.transactionQueryByTransactionId(data);
      // Process the response received from SSLCommerz
      // Refer to the documentation for available response fields:
      // https://developer.sslcommerz.com/doc/v4/#by-session-id
      return response;
    } catch (error) {
      // Handle any errors that occur during the transaction query
      console.error(error);
      throw new HttpException('Error querying transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/transaction-query-by-session-id/:sessionkey')
  async transactionQueryBySessionId(@Param('sessionkey') sessionkey: string) {
    const data = {
      sessionkey: sessionkey,
    };
    const sslcz = new SSLCommerzPayment( process.env.SSL_STORE_ID, process.env.SSL_STORE_PASSWORD, false);
      const response = await sslcz.transactionQueryBySessionId(data);
      return response;
    } catch (error) {
      // Handle any errors that occur during the transaction query
      console.error(error);
      throw new HttpException('Error querying transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

