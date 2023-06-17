import { IsEmail } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Subscription {
   @PrimaryGeneratedColumn()
   id:number
   @IsEmail()
   @Column()
   Email:string
   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
   public Date: Date;
  
}
