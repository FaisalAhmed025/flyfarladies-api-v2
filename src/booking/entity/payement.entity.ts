
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
const crypto = require('crypto');
const secretKey = 'my-secret-key';
const maxValue = 10000;

@Entity()
export class Payement{
   @PrimaryGeneratedColumn('uuid')
   PayementId:string
   @BeforeInsert()
   async generateUniqueRandomNumber() {
     const timestamp = new Date().toISOString();
     const data = `${timestamp}-${secretKey}`;
     const hash = crypto.createHash('sha256').update(data).digest('hex');
     const randomNumber = parseInt(hash, 16) % maxValue;
     this.PayementId = `FFLP${randomNumber.toString().padStart(4, '0')}`;
   }
  @Column()
  tourPackageId:string
  @Column()
  uuid: string;
  @Column()
  installmentId: number;
  @Column()
  amount: number; 
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

}