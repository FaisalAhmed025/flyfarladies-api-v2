import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Bkash{
   @PrimaryGeneratedColumn('uuid')
   id:string
   @Column('double')
   Amount:number
   @Column('double')
   GatewayFee:number
   @Column('double')
   DepositedAmount:number
}