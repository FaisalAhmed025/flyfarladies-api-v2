
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tourpackage } from './tourpackage.entity';

@Entity()
export class AlbumImage{
   @PrimaryGeneratedColumn()
   AlbumId: number;
   @Column({nullable:true})
   AlbumTitle: string;
   @Column({nullable:true})
   albumImageUrl: string;
   @ManyToOne(() => Tourpackage, (tourpackage)=>tourpackage.albumImages)
   tourpackage:Tourpackage;
   
}
