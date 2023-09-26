import {
    Entity,
    Column,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { VItemUseEntity } from './_item-use.entity';

@Entity('_item_files')
export class VItemFileEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemUseEntity, item_use => item_use.files)
        uses: VItemUseEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
