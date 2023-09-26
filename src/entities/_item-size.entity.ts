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
import { VItemCategoryEntity } from './_item-category.entity';

@Entity('_item_sizes')
export class VItemSizeEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemCategoryEntity, item_category => item_category.sizes)
        categories: VItemCategoryEntity[];

    @OneToMany(() => ItemEntity, item => item.country_standard)
        items: ItemEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
