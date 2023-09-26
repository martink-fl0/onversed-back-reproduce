import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';

import { CompanyEntity } from './company.entity';

enum ECompanyPaymentMethod {
    Stripe,
    Paypal,
    CreditCard,
    BankTransfer,
    BankIban,
}

@Entity('company_payments')
export class CompanyPaymentEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column('json') info: any;
    @Column() default: boolean;
    @Column({ type: 'enum', enum: ECompanyPaymentMethod }) payment_method: ECompanyPaymentMethod;

    @ManyToOne(() => CompanyEntity, { onDelete: 'CASCADE' })
        company: CompanyEntity;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
    @DeleteDateColumn() deleted_at: Date;
}
