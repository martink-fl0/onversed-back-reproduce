import {
    Entity,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ItemEntity } from './item.entity';
import { CollectionEntity } from './collection.entity';

export enum EBlobType {
    SpecificationSheet,
    Drawing,
    FrontItem,
    BackItem,
    Logos,
    Other,
    Cover,
}

@Entity('blobs')
export class BlobEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() url: string;
    @Column() size: string;
    @Column() mime: string;
    @Column() name: string;
    @Column() request_id: string;
    @Column({ type: 'enum', enum: EBlobType }) type: EBlobType;

    @ManyToOne(() => ItemEntity, item => item.blobs,
        { onDelete: 'CASCADE' }
    )
        item: ItemEntity;

    @ManyToOne(() => CollectionEntity, collection => collection.blobs,
        { onDelete: 'CASCADE' }
    )
        collection: CollectionEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
