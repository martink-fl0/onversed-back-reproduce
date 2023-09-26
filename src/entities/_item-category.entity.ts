import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn, JoinTable,
} from 'typeorm';

import { ItemEntity } from './item.entity';
import { VItemUseEntity } from './_item-use.entity';
import { VItemSizeEntity } from './_item-size.entity';
import { VItemCountryStandardEntity } from './_item-country-standard.entity';

@Entity('_item_categories')
export class VItemCategoryEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemUseEntity, item_use => item_use.categories)
        uses: VItemUseEntity[];

    @ManyToMany(() => VItemSizeEntity, item_size => item_size.categories)
    @JoinTable()
        sizes: VItemSizeEntity[];

    @OneToMany(() => ItemEntity, item => item.category)
        items: ItemEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
