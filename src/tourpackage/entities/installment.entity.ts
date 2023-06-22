import { Booking } from 'src/booking/entity/booking.entity';
import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum InstallmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
}


@Entity()
export class Installment {
  @PrimaryGeneratedColumn()
  InstallmentId: number;
  @Column({nullable:true})
  Name: string;
  @Column({type:'date', nullable:true})
  Date: string;
  @Column({nullable:true})
  Amount: number;
  @Column({nullable:true})
  TotalAmount: number;
  @Column({ default: InstallmentStatus.PENDING })
  status: InstallmentStatus;
  @ManyToOne(() => Tourpackage, (tourpackage) => tourpackage.installments,{onDelete:'CASCADE',onUpdate:'CASCADE'})
  tourpackage: Tourpackage
  @ManyToOne(() => Booking, booking => booking.installments,{lazy:true, onDelete:'CASCADE', onUpdate:'CASCADE'})
  booking: Booking;
}