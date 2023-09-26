import {
    Entity,
    Column,
    JoinTable,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { VItemTypeEntity } from './_item-type.entity';
import { VItemFileEntity } from './_item-file.entity';
import { VItemCategoryEntity } from './_item-category.entity';
import { VItemCountryStandardEntity } from './_item-country-standard.entity';

@Entity('_item_uses')
export class VItemUseEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() label: string;

    @ManyToMany(() => VItemTypeEntity, item_type => item_type.uses)
    @JoinTable()
        types: VItemTypeEntity[];

    @ManyToMany(() => VItemCategoryEntity, item_type => item_type.uses)
    @JoinTable()
        categories: VItemCategoryEntity[];

    @ManyToMany(() => VItemFileEntity, item_file => item_file.uses)
    @JoinTable()
        files: VItemFileEntity[];

    @ManyToMany(() => VItemCountryStandardEntity, item_country_standard => item_country_standard.uses)
    @JoinTable()
        countries: VItemCountryStandardEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
