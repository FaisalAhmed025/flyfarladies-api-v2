import { IsEmail } from "@nestjs/class-validator"
import { IsNotEmpty } from "class-validator"
import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, UpdateDateColumn } from "typeorm"


@Entity()
export class Admin{
   @PrimaryColumn({type:"uuid"})
   @Generated("uuid")
   Id:string
   @IsNotEmpty()
   @Column()
   Name:string
   @IsNotEmpty()
   @Column()
   Mobile:string
   @IsEmail()
   @IsNotEmpty()
   @Column()
   Email:string
   @IsNotEmpty()
   @Column()
   Password:string
   @Column({nullable:true})
   jwtToken:string
   @CreateDateColumn()
   CreatedAt:Date
   @UpdateDateColumn()
   UpdatedAt:Date
}