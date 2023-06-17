
import { Traveller } from 'src/Traveller/entities/traveller.entity';
import { Ledger } from 'src/ledger/entities/ledger.entity';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, Column, BeforeInsert, Repository, getConnection, JoinColumn, OneToMany } from 'typeorm';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BookingStatus {
   HOLD = 'hold',
   ISSUE_IN_PROCESS = 'issue in process',
   CONFIRMED = 'confirmed',
   CANCELLED = 'cancelled',
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
   ActionBy:string
   @Column()
   CancelledReason:string
   @BeforeInsert()
   generateUserId() {
      userCount++;
      this.Bookingid = `FFLB${100 + userCount}`;
   }
   @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.HOLD })
   status: BookingStatus;
   @ManyToOne(() => Tourpackage, (tourPackage) => tourPackage.bookings,{onDelete:'CASCADE'})
   tourPackage: Tourpackage;
   @ManyToMany(() => Traveller)
   @JoinTable({name: 'Traveler_bookings'})
   travelers: Traveller[];
   @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
   public Created_At: Date;
   @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
   public Updated_At: Date;
   @OneToMany(() => Ledger, ledger => ledger.booking)
   ledger: Ledger[];
}