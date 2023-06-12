import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PressCoverages{
   @PrimaryGeneratedColumn('uuid')
   uuid:string
   @Column()
   Image:string
   @Column({length:1000})
   Description:string
   @Column({type:'date'})
   Date:Date
   @Column()
   links:string

}