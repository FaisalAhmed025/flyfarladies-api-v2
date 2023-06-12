
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';

@Entity()
export class MainImage{
   @PrimaryGeneratedColumn()
   mainimgId: number;
   @Column({default:true})
   MainImageTitle: string;
   @Column({default:true})
   MainImageUrl: string;
   @ManyToOne(() => Tourpackage, tourpackage=>tourpackage.mainimage)
   tourpackage:Tourpackage;
   
}
