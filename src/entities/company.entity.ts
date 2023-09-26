import {
    Entity,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ProfileEntity } from './profile.entity';
import { CollectionEntity } from './collection.entity';
import { ItemEntity } from './item.entity';

@Entity('companies')
export class CompanyEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() name: string;
    @Column({ nullable: true }) nif: string;
    @Column({ nullable: true }) address: string;
    @Column({ nullable: true }) logo_url: string;
    @Column({ default: true }) is_active: boolean;

    @OneToMany(() => ProfileEntity, profile => profile.company)
        profiles: ProfileEntity[];

    @OneToMany(() => CollectionEntity, collection => collection.company)
        collections: CollectionEntity[];

    @OneToMany(() => ItemEntity, item => item.company)
        items: ItemEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
