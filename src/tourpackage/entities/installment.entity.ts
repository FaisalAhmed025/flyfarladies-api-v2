import { Tourpackage } from 'src/tourpackage/entities/tourpackage.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


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
  @ManyToOne(() => Tourpackage, (tourpackage) => tourpackage.installments)
  tourpackage: Tourpackage
}