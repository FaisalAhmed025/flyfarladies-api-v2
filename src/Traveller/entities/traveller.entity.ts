
import { User } from 'src/userProfile/entitties/user.entity';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Traveller {
   @PrimaryGeneratedColumn('uuid')
   TravellerId:string
   @Column({default:null})   
   FirstName:string
   @Column({default:null})   
   Title:string
   @Column({default:null})
   LastName:string
   @Column({default:null})
   DOB:Date
   @Column({ nullable: true, type:'integer' })
   Age: number;
   @BeforeInsert()
    calculateAge() {
     const today = new Date();
     const birthDate = new Date(this.DOB);
     let age = today.getFullYear() - birthDate.getFullYear();
     const monthDiff = today.getMonth() - birthDate.getMonth();
 
     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
       age--;
     }
 
     this.Age = age;
   }
   @Column({nullable:true})
   Email: string
   @Column({default:null})
   Gender:string
   @Column({default:null})
   Price:number
   @Column({default:null})
   Nationality:string
   @Column({default:null})
   PassportNumber:string
   @Column({default:null})
   PassportExpireDate:string
   @Column({default:null})
   PaxType:string
   @Column({default:null})
   PassportCopyURL:string
   @ManyToOne(() => User, (user) => user.travelers)
   user:User;
   @CreateDateColumn()
   CreatedAt:Date
   @UpdateDateColumn()
   UpdatedAt:Date
}