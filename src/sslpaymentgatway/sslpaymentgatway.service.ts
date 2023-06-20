import { Body, Req } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

const SSLCommerzPayment = require('sslcommerz-lts')

@Injectable()
export class SslpaymentgatwayService {
   private store_id: string;
   private store_passwd: string;
   private is_live: boolean;
   private initURL: string;
   constructor(
    ) {   
    this.store_id = 'flyfa61361258eb3e1'; // Replace with your actual store_id
    this.store_passwd = 'flyfa61361258eb3e1@ssl'; // Replace with your actual store_password
    this.is_live = false; // Replace with your actual environment
    this.initURL = 'localhost:5000/'; // Replace with your actual init U
   }
  
    async initiatePayment(data: any): Promise<string> {
      // SSLCommerz init
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const apiResponse = await sslcz.init(data);
      const gatewayPageURL = apiResponse.GatewayPageURL;
      return gatewayPageURL;
    }
  
    async validateTransaction(@Body('val_id') val_id: string, @Req() req: Request) {
      // SSLCommerz validation
      const data = {
        val_id: val_id
      };
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const validationData = await sslcz.validate(data);
      return validationData;
      // Process the validation response
    }
  
    // async initiateRefund(@Body('val_id') val_id: string, @Req() req: Request): Promise<void> {
    //   // SSLCommerz initiateRefund
    //   const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
    //   const refundData = await sslcz.initiateRefund(data);
    //   // Process the refund response
    // }
  
    async refundQuery(data: any): Promise<void> {
      // SSLCommerz refundQuery
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const refundQueryData = await sslcz.refundQuery(data);
      // Process the refund query response
    }
  
    async transactionQueryByTransactionId(data: any): Promise<void> {
      // SSLCommerz transactionQueryByTransactionId
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const transactionData = await sslcz.transactionQueryByTransactionId(data);
      // Process the transaction query response
    }
  
    async transactionQueryBySessionId(data: any): Promise<void> {
      // SSLCommerz transactionQueryBySessionId
      const sslcz = new SSLCommerzPayment('flyfa61361258eb3e1', 'flyfa61361258eb3e1@ssl', false);
      const transactionData = await sslcz.transactionQueryBySessionId(data);
      // Process the transaction query response
    }
}
