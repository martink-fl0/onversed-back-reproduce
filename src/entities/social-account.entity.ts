import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne
} from 'typeorm';

import { UserEntity } from './user.entity';
import { SocialProviderEntity } from './social-provider.entity';


@Entity('social-accounts')
export class SocialAccountEntity {
    @PrimaryGeneratedColumn('uuid') id: string;


    @Column() social_user_id: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
        user: UserEntity;

    @ManyToOne(() => SocialProviderEntity, { onDelete: 'CASCADE' })
        social_provider: SocialProviderEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn()deleted_at: Date;
}
