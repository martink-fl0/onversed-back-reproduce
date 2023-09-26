import {
    Entity,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('tokens')
export class TokenEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() token: string;
    @Column() token_type: string;
    @Column({ nullable: true }) expires_in: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
        user: UserEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn()deleted_at: Date;
}
