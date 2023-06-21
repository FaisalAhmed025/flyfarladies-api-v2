import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


export enum SSLpaymentStatus {
  VALID = 'VALID',
  VALIDATED = 'VALIDATED',
  REJECTED = 'rejected',
}

@Entity()
export class SSLCommerzEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  cus_name: string;
  @Column()
  cus_email: string;
  @Column()
  cus_phone: string;
  @Column()
  tran_id: string;
  @Column()
  card_no: string;
  @Column()
  total_amount: number;
  @Column()
  currency: string;
  @Column()
  error: string;
  @Column()
  val_id: string;
  @Column()
  tran_date: Date;
  @Column()
  status: string;
  @Column()
  store_amount: number;
  @Column()
  bank_tran_id: string;
  @Column()
  card_type: string;
  @Column()
  card_brand: string;
  @Column()
  card_issuer_country: string;
  // @Column()
  // card_issuer:string
  // @Column()
  // store_id:string
  // @Column()
  // verify_sign:string
  // @Column()
  // currency_amount:string
  // @Column()
  // currency_rate:string
  // @Column()
  value_a:string
  @Column()
  value_b:string
  @Column()
  value_c:string
  // @Column()
  // risk_title:string
  @Column({ type: 'enum', enum: SSLpaymentStatus, default: SSLpaymentStatus.VALID })
  paymentstatus:SSLpaymentStatus
  

  // Add more fields as per your requirements

  // You can also define relationships with other entities if needed
}



export class SSLCommerzPayment {
   constructor(
     public store_id: string,
     public store_passwd: string,
     public live = false,
   ) {}

}
