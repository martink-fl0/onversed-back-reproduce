import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';

import { CompanyEntity } from './company.entity';

@Entity('company_addresses')
export class CompanyAddressEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() address: string;

    @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
        company: CompanyEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
