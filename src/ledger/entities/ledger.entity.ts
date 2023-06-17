import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ledger {
   @PrimaryGeneratedColumn()
   id:number
   @Column()
   Referenceid:string
   @Column()
   Type:string
   @Column()
   Amount:number
   @Column()
   Date:Date
   @Column()
   Remarks:string
   @Column()
   Balance:number
}
