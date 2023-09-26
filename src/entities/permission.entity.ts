import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() flow: string;
    @Column() c: number;
    @Column() r: number;
    @Column() u: number;
    @Column() d: number;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn()deleted_at: Date;
}
