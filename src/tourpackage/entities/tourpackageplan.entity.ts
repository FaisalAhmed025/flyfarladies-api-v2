import { IsNotEmpty } from '@nestjs/class-validator';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';

@Entity()
export class tourpackageplan {
  @PrimaryGeneratedColumn()
  dayId: number;
  @IsNotEmpty()
  @Column({length:1000})
  dayplan: string;
  @ManyToOne(()=>Tourpackage, (tourpackages)=>tourpackages.tourpackageplans)
  @JoinColumn({ name: 'Tour_package_plan' })
  tourpackage:Tourpackage
 
}
