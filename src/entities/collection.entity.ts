import {
    Entity,
    Column,
    JoinTable,
    ManyToOne,
    OneToMany,
    ManyToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ItemEntity } from './item.entity';
import { BlobEntity } from './blob.entity';
import { ProfileEntity } from './profile.entity';
import { CompanyEntity } from './company.entity';
import { ActivityEntity, EActivityState } from './activity.entity';

@Entity('collections')
export class CollectionEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true }) name: string;

    @Column() nft_url: string;
    @Column() is_agreed: boolean;
    @Column({ type: 'varchar', length: 155 }) description: string;
    @Column({ type: 'varchar', length: 155 }) other_description: string;
    @Column({ type: 'enum', enum: EActivityState }) state: EActivityState;

    @Column({ default: false }) is_assets: boolean;
    @Column({ default: false }) is_roblox: boolean;
    @Column({ default: false }) is_zepeto: boolean;
    @Column({ default: false }) is_factory: boolean;
    @Column({ default: false }) is_spatial: boolean;
    @Column({ default: false }) is_inherited: boolean;
    @Column({ default: false }) is_decentraland: boolean;

    @OneToMany(() => BlobEntity, blob => blob.collection)
        blobs: BlobEntity[];

    @OneToMany(() => ItemEntity, item => item.collection)
        items: ItemEntity[];

    @OneToMany(() => ActivityEntity, activity => activity.collection)
        activities: ActivityEntity[];

    @ManyToOne(() => CompanyEntity, company => company.collections,
        { onDelete: 'CASCADE' }
    )
        company: CompanyEntity;

    @ManyToMany(() => ProfileEntity, profile => profile.collections)
    @JoinTable()
        designers: ProfileEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
