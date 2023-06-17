import { Booking } from "src/booking/entity/booking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ledger {
   @PrimaryGeneratedColumn()
   id:number
   @Column()
   Referenceid:string
   @Column()
   Type:string
   @Column()
   Amount:number
   @Column()
   Date:Date
   @Column()
   Remarks:string
   @Column()
   Balance:number
   @ManyToOne(() => Booking, booking => booking.ledger)
   @JoinColumn({ name: 'bookingId' })
   booking: Booking;
}
