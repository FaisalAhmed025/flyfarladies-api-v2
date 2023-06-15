import { BeforeInsert, Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"
import { IsNotEmpty, isNotEmpty } from "class-validator";


export enum PaymentStatus {
   PENDING = 'pending',
   APPROVED = 'approved',
   REJECTED = 'rejected',
 }

const crypto = require('crypto');
const keyKey = 'kapjhapkappa';
const maximumValue = 100000;
@Entity()
export class BankTransfer{
   @PrimaryGeneratedColumn('uuid')
   Depositid:string
   @BeforeInsert()
   async generateUniqueRandomNumber() {
     const timestamp = new Date().toISOString();
     const data = `${timestamp}-${keyKey}`;
     const hash = crypto.createHash('sha256').update(data).digest('hex');
     const randomNumber = parseInt(hash, 16) % maximumValue;
     this.Depositid =`Bank${randomNumber.toString().padStart(4,'0')}`;
   }
   @IsNotEmpty()
   @Column()
   uuid:string
   @Column({nullable:true})
   DepositFrom:string
   @Column({nullable:true})
   DepositTo:string
   @Column()
   ChequeNumber:string
   @Column({type:'date'})
   ChequeDate:string
   @CreateDateColumn()
   CreatedAt:Date
   @Column({nullable:true})
   TransactionId:string
   @Column({nullable:true})
   DepositType:string
   @Column({nullable:true})
   Amount:number
   @Column({nullable:true})
   Bankattachmenturl:string
   @Column()
   ActionBy:string
   @Column()
   rejectionReason:string
   @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
   status: PaymentStatus;
   @ManyToOne(()=>User, (userprofile)=>userprofile.bankDeposit)
   @JoinColumn({name:'user_Id',})
   userprofile:User
}