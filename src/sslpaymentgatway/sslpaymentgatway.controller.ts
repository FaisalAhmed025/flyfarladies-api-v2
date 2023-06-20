import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Redirect, Req, Res } from '@nestjs/common';
import { SslpaymentgatwayService } from './sslpaymentgatway.service';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { SSLCommerzEntity } from './entity';
import { Repository } from 'typeorm';
const SSLCommerzPayment = require('sslcommerz-lts')
import { v4 as uuidv4 } from 'uuid';

@Controller('sslpaymentgatway')
export class SslpaymentgatwayController {
  constructor(@InjectRepository(SSLCommerzEntity) private sslcommerzRepository:Repository<SSLCommerzEntity>, private readonly sslpaymentgatwayService: SslpaymentgatwayService) {}


  @Post('init')
  async init(@Req() req: Request): Promise<{ message: string; url?: string }> {
    try {
      const transactionId =uuidv4();
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const requestData = { ...req.body, tran_id: `ffltx${transactionId}`}; // Add the transaction ID to the request data
      const apiResponse = await sslcz.init(requestData);
      const gatewayPageURL = apiResponse.GatewayPageURL;
      return gatewayPageURL;
    } catch (error) {
      throw new Error('Failed to initiate payment');
    }
  }
  
  

  @Post('success')
  async create( 
    @Body() data: any,
    @Req() request: Request): Promise<any> {
    // Access the request body data
    console.log(data);
    console.log(request.headers);
    // const x= await this.sslcommerzRepository.create(data)
    await this.sslcommerzRepository.save(data)
    return { message: 'Payment successful', data: data};
  }
  
  

  @Post('/validate')
  async validate(@Body('val_id') val_id: string, @Req() req: Request): Promise<any> {
    const data = {
      val_id: val_id
    };
    const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
    const validationData = await sslcz.validate(data);
    await this.sslcommerzRepository.save(validationData)
    return validationData;
  }
  

  @Post('/initiate-refund')
  async initiateRefund(@Body() body: any) {
    const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
    try {
      const response = await sslcz.initiateRefund(body);

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
    const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
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
    const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
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
      SESSIONKEY: sessionkey,
    };
    const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const response = await sslcz.transactionQueryBySessionId(data);
      // Process the response received from SSLCommerz
      // Refer to the documentation for available response fields:
      // https://developer.sslcommerz.com/doc/v4/#by-session-id

      // // Save the response or perform any additional logic using TypeORM
      // const transactionEntity = new SSLCommerzEntity();
      // transactionEntity.sessionKey = SESSIONKEY;
      // await this.sslcommerzRepository.save(transactionEntity);

      return response;
    } catch (error) {
      // Handle any errors that occur during the transaction query
      console.error(error);
      throw new HttpException('Error querying transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

