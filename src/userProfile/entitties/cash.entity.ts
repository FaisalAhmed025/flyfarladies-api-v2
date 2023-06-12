import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";



@Entity()
export class Cash{
   @PrimaryGeneratedColumn('uuid')
   id:string
   @Column()
   Name:string
   @Column()
   ReceiverName:string
   @Column()
   Reference:string
   @Column()
   Amount:number
   @Column()
   DepositType:string
   @Column()
   cashattachmenturl:string
   @ManyToOne(()=>User, (userprofile)=>userprofile.cashDeposit)
   @JoinColumn({name:'cash_Id'})
   userprofile:User

}