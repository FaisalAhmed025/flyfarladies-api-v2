import { IsNotEmpty } from '@nestjs/class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';


@Entity()
export class bookingpolicy {
    @PrimaryGeneratedColumn()
    BkId: number
    @IsNotEmpty()
    @Column({length: 1000})
    description:string;
    @ManyToOne(()=>Tourpackage, (tourpackages)=>tourpackages.BookingPolicys)
    @JoinColumn({name:'policyId'})
    tourpackage:Tourpackage
   
}

