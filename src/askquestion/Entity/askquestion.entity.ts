import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AskQuestion{
   @PrimaryGeneratedColumn('uuid')
   id:string
   @Column()
   FullName:string
   @Column()
   Email:string
   @Column()
   Phone:string
   @Column()
   TourType:string
   @Column()
   Description:string
   @Column()
   Date:Date
   @Column()
   Traveller:number
}