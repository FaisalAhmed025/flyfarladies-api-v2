
import { Column, Entity,ManyToOne,PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';


@Entity()
export class refundpolicy {
    @PrimaryGeneratedColumn()
    RId: number
    @Column({nullable:true,length: 1000})
    RefundPolicy:string
    @ManyToOne(()=>Tourpackage,(tourpackages)=>tourpackages.refundpolicys)
    tourpackage:Tourpackage;
}