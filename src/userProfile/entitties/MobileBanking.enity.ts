import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./user.entity"



export enum PaymentStatus {
   PENDING = 'pending',
   APPROVED = 'approved',
   REJECTED = 'rejected',
 }


 let userCount =Math.floor(Math.random() * 10000);
@Entity()
export class MobileBanking{
   @PrimaryGeneratedColumn('uuid')
   Depositid:string
   @BeforeInsert()
   generateUserId() {
      userCount++;
      this.Depositid = `MB${100 + userCount}`;
   }
   @Column()
   uuid:string
   @Column({nullable:true})
   AgentType:string
   @Column({nullable:true})
   @CreateDateColumn()
   CreatedAt:Date
   @Column()
   AccountNumber:string
   @Column({nullable:true})
   TransactionId:string
   @Column({nullable:true})
   Reference:string
   @Column('double')
   Amount:number
   @Column('double')
   GatewayFee:number
   @Column('double')
   DepositedAmount:number
   @Column()
   MobBankattachmenturl:string
   @Column({default:null, nullable:true})
   DepositType:string
   @Column()
   rejectionReason:string
   @Column()
   ActionBy:string
   @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
   status: PaymentStatus;
   @ManyToOne(()=>User, (userprofile)=>userprofile.mobilebankDeposit)
   @JoinColumn({name:'Mbank_Id',})
   userprofile:User
}