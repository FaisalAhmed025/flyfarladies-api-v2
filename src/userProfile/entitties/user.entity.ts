import { IsEmail } from "@nestjs/class-validator"
import { IsNotEmpty } from "class-validator"
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Cheque } from "./cheq.entity"
import { Cash } from "./cash.entity"
import { MobileBanking } from "./MobileBanking.enity"
import { BankTransfer } from "./BankTransfer.entity"
import { Traveller } from "src/Traveller/entities/traveller.entity"
const crypto = require('crypto');
const secretKey = 'my-secret-key';
const maxValue = 10000;
@Entity()
export class User{
  @PrimaryGeneratedColumn('uuid')
   uuid:string    
   @BeforeInsert()
    async generateUniqueRandomNumber() {
      const timestamp = new Date().toISOString();
      const data = `${timestamp}-${secretKey}`;
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      const randomNumber = parseInt(hash, 16) % maxValue;
      this.uuid = `FFLU${randomNumber.toString().padStart(4, '0')}`;
    }
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
   @IsNotEmpty()
   @Column({nullable:true})
   jwtToken:string
   @IsNotEmpty()
   @Column({nullable:true})
   NameTitle:string
   @IsNotEmpty()
   @Column()
   picture:string
   @Column({nullable:true})
   accessToken:string
   @Column({nullable:true})
   refreshToken:string
   @IsNotEmpty()
   @Column({default:null})   
   FirstName:string
   @IsNotEmpty()
   @Column({default:null})
   LastName:string
   @IsNotEmpty()
   @Column({default:null})
   DOB:string
   @IsNotEmpty()
   @Column({default:false})
   Gender:string
   @IsNotEmpty()
   @Column({default:null})
   Profession:string
   @IsNotEmpty()
   @Column({default:null})
   Nationality:string
   @IsNotEmpty()
   @Column({default:null})
   NID:string
   @Column({default:null})
   Address:string
   @IsNotEmpty()
   @Column({default:null})
   PassportNumber:string
   @Column({default:null})
   Wallet:number
   @IsNotEmpty()
   @Column({default:null})
   PassportExpireDate:string
   @IsNotEmpty()
   @Column({default:null})
   PassportCopy:string
   @IsNotEmpty()
   @Column({default:null})
   PassportsizephotoUrl: string
   @IsNotEmpty() 
   @Column({default:null})
   FaceBookId:string
   @IsNotEmpty()
   @Column({default:null})
   @CreateDateColumn()
   CreatedAt:Date
   @Column()
   WhatsApp:string
   @IsNotEmpty()
   @Column({default:null})
   LinkedIn:string
   @Column({ default:null,type:'simple-array', nullable:true })
   wishlist: string[];
   @OneToMany(() => Cheque, (cheque) => cheque.userprofile,{lazy:true})
   chequeDeposit:Promise<Cheque[]>
   @OneToMany(() => Cash, (cash) => cash.userprofile,{lazy:true})
   cashDeposit:Promise<Cash[]>
   @OneToMany(() => MobileBanking, (mobilebank) => mobilebank.userprofile,{lazy:true})
   mobilebankDeposit:Promise<MobileBanking[]> 
   @OneToMany(() => BankTransfer, (banktransfer) => banktransfer.userprofile,{lazy:true})
   bankDeposit:Promise<BankTransfer[]> 
   @OneToMany(()=>Traveller, (traveller)=>traveller.user,{lazy:true})
   travelers:Promise<Traveller[]>
}