
import { IsNotEmpty } from '@nestjs/class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';

@Entity()
export class Packageinclusion {
  @PrimaryGeneratedColumn()
  InId: number; 
  @IsNotEmpty()
  @Column({length: 1000})
  Inclusions:string
  @ManyToOne(()=>Tourpackage, (tourpackages)=>tourpackages.PackageInclusions)
  @JoinColumn({name:'inclusionId'})
  tourpackage:Tourpackage

  
}
