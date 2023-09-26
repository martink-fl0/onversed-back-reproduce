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
import { ProfileEntity } from './profile.entity';
import { CollectionEntity } from './collection.entity';

export enum EActivityState {
    Draft,
    Sent,
    Progress,
    Ready,
    Finished,
    Deleted,
}

@Entity('activities')
export class ActivityEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ type: 'enum', enum: EActivityState }) type: EActivityState;

    @ManyToOne(() => CollectionEntity, collection => collection.activities,
        { onDelete: 'CASCADE' }
    )
        collection: CollectionEntity;


    @ManyToOne(() => ItemEntity, item => item.activities,
        { onDelete: 'CASCADE' }
    )
        item: ItemEntity;

    @ManyToOne(() => ProfileEntity, profile => profile.activities,
        { onDelete: 'CASCADE' }
    )
        profile: ProfileEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
