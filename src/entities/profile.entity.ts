import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany
} from 'typeorm';

import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';
import { CompanyEntity } from './company.entity';
import { CollectionEntity } from './collection.entity';
import { ActivityEntity } from './activity.entity';

@Entity('profiles')
export class ProfileEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() last_name: string;
    @Column() first_name: string;

    @Column({ nullable: true }) job_title: string;
    @Column({ nullable: true }) avatar_url: string;
    @Column({ nullable: true }) avatar_id: string;

    @Column({ default: false }) is_staff: boolean;
    @Column({ default: false }) is_customer: boolean;
    @Column({ default: false }) is_generated: boolean;

    @ManyToOne(() => UserEntity, user => user.profiles,
        { onDelete: 'CASCADE' }
    )
        user: UserEntity;

    @ManyToOne(() => CompanyEntity, company => company.profiles,
        { onDelete: 'CASCADE' }
    )
        company: CompanyEntity;

    @OneToMany(() => ActivityEntity, activity => activity.profile)
        activities: ActivityEntity[];

    @ManyToMany(() => RoleEntity)
    @JoinTable()
        roles: RoleEntity[];

    @ManyToMany(() => CollectionEntity, collection => collection.designers)
        collections: CollectionEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
