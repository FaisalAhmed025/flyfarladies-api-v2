import { IsEmail } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Subscription {
   @PrimaryGeneratedColumn()
   id:number
   @IsEmail()
   @Column()
   Email:string
}
