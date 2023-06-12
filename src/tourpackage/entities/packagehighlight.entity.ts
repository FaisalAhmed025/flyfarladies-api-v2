import { IsNotEmpty } from '@nestjs/class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';


@Entity()
export class packagehighlight {
  @PrimaryGeneratedColumn()
  HiId: number;
  @IsNotEmpty()
  @Column({length: 1000})
  description: string;
  @ManyToOne(()=>Tourpackage, (tourpackages)=>tourpackages.highlights)
  @JoinColumn({ name: 'Tour_package_Hightlights' })
  tourpackage:Tourpackage
  
}