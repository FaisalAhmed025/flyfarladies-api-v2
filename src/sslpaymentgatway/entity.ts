import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SSLCommerzEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tran_id: string;

  @Column()
  amount: number;

  @Column()
  currency: string;
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
  @Column()
  sessionKey:string
  

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
