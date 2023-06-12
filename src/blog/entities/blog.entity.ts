import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Blog {
   @PrimaryGeneratedColumn('uuid')
   blogid:string
   @Column({default:null})
   Title:string
   @Column({default:null})
   Type:string
   @Column({default:null, type:'longtext'})
   Blogfor:string
   @Column({default:null, type:'longtext'})
   WrittenBy:string
   @Column({default:null, type:'longtext'})
   Description:string
   @Column({default:null, type:'simple-array'})
   blogimages:string[]
   @CreateDateColumn()
   Date:Date

}
