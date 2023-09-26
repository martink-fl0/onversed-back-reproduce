import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('code_verifications')
export class CodeVerificationEntity {
    @PrimaryGeneratedColumn() id: string;

    @Column() code: string;
    @Column({ default: false }) is_sms: boolean;
    @Column({ default: false }) is_email: boolean;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
        user: UserEntity;

    @CreateDateColumn() created_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
