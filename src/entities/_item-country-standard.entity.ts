import {
    Entity,
    Column,
    OneToMany,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ItemEntity } from './item.entity';
import { VItemUseEntity } from './_item-use.entity';

@Entity('_item_countries_standards')
export class VItemCountryStandardEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemUseEntity, item_use => item_use.countries)
        uses: VItemUseEntity[];

    @OneToMany(() => ItemEntity, item => item.country_standard)
        items: ItemEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
