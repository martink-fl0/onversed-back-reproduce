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

@Entity('_item_types')
export class VItemTypeEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemUseEntity, item_use => item_use.types)
        uses: VItemUseEntity[];

    @OneToMany(() => ItemEntity, item => item.type)
        items: ItemEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
