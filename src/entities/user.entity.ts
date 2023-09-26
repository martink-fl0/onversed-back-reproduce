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

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ nullable: true }) lang: string;
    @Column({ unique: true }) email: string;
    @Column() password: string;
    @Column({ nullable: true }) last_name: string;
    @Column({ nullable: true }) first_name: string;
    @Column({ default: false }) is_social: boolean;
    @Column({ default: false }) is_active: boolean;
    @Column({ nullable: true }) mobile_phone: string;
    @Column({ default: false }) is_confirmed: boolean;

    @OneToMany(() => ProfileEntity, profile => profile.user)
        profiles: ProfileEntity[];

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
