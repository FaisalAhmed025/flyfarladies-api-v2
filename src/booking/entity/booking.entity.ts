
import { Traveller } from 'src/Traveller/entities/traveller.entity';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, Column, BeforeInsert, getRepository, Repository, getConnection } from 'typeorm';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BookingStatus {
   HOLD = 'hold',
   APPROVED = 'approved',
   REJECTED = 'rejected',
 }

let userCount = Math.floor(Math.random() * 10000);

@Entity()
export class Booking{
   @PrimaryGeneratedColumn('uuid')
   uuid:string
   @Column()
   Bookingid:string
   @CreateDateColumn()
   CreatedAt:Date
   @UpdateDateColumn()
   UpdatedAt:Date
   @Column()
   Email:string
   @Column()
   userid:string
   @Column()
   MainTitle:string
   @Column({default:null})
   SubTitle:string
   @Column()
   Name:string
   @Column()
   TotalPrice:number
   @Column({default:null, nullable:true})
   Wallet:number
   @Column({default:null})
   FaceBookId:string
   @Column({default:null})
   WhatsApp:string
   @Column({default:null})
   LinkedIn:string
   @Column({default:null})
   Mobile:string
   @Column({default:null})
   packageId:string
   @Column()
   rejectionReason:string
   @BeforeInsert()
   generateUserId() {
      userCount++;
      this.Bookingid = `FFLB${100 + userCount}`;
   }
   @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.HOLD })
   status: BookingStatus;
   @ManyToOne(() => Tourpackage, tourPackage => tourPackage.bookings)
   tourPackage: Tourpackage;
   @ManyToMany(() => Traveller)
   @JoinTable({name: 'Traveler_bookings'})
   travelers: Traveller[];
}