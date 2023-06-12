import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Testimonial {
   @PrimaryGeneratedColumn('uuid')
   testid:string
   @Column()
   ClientName:string
   @Column()
   ClientDesignation:string
   @Column()
   CompanyName:string
   @Column()
   ClientImage:string
   @Column({default:null, type:'simple-array'})
   testimonialimages:string[]
   @Column({default:null, length:1000})
   Description:string
   @CreateDateColumn()
   Date:Date

}
