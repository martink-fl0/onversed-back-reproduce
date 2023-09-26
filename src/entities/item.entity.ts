import {
    Entity,
    Column,
    OneToMany,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { BlobEntity } from './blob.entity';
import { VItemTypeEntity } from './_item-type.entity';
import { CollectionEntity } from './collection.entity';
import { VItemCategoryEntity } from './_item-category.entity';
import { ActivityEntity, EActivityState } from './activity.entity';
import { CompanyEntity } from './company.entity';
import { VItemSizeEntity } from './_item-size.entity';
import { VItemCountryStandardEntity } from './_item-country-standard.entity';

@Entity('items')
export class ItemEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() name: string;
    @Column() nft_url: string;
    @Column({ unique: true }) sku: string;
    @Column({ type: 'text' }) description: string;
    @Column({ type: 'enum', enum: EActivityState }) state: EActivityState;

    @Column({ default: false }) is_assets: boolean;
    @Column({ default: false }) is_roblox: boolean;
    @Column({ default: false }) is_zepeto: boolean;
    @Column({ default: false }) is_factory: boolean;
    @Column({ default: false }) is_spatial: boolean;
    @Column({ default: false }) is_decentraland: boolean;

    @OneToMany(() => BlobEntity, blob => blob.item)
        blobs: BlobEntity[];

    @ManyToOne(() => CollectionEntity, collection => collection.items,
        { onDelete: 'CASCADE' }
    )
        collection: CollectionEntity;

    @OneToMany(() => ActivityEntity, activity => activity.item)
        activities: ActivityEntity[];

    @ManyToOne(() => CompanyEntity, company => company.items,
        { onDelete: 'CASCADE' }
    )
        company: CompanyEntity;

    @ManyToOne(() => VItemCategoryEntity, category => category.items)
        category: VItemCategoryEntity;

    @ManyToOne(() => VItemTypeEntity, item_type => item_type.items)
        type: VItemTypeEntity;

    @ManyToOne(() => VItemCountryStandardEntity, country => country.items)
        country_standard: VItemCountryStandardEntity;

    @ManyToOne(() => VItemSizeEntity, size => size.items)
        size: VItemSizeEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
