import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { UserEmployeeInput } from '../gql';
import { UserService } from './user.service';
import { MailService } from '../../mail/services';
import { MAIL_EMPLOYEE_INVITE, MAIL_WELCOME_TEAM } from '../../mail/templates';
import { UserEntity } from "../../../entities/user.entity";
import { CompanyEntity } from "../../../entities/company.entity";
import { ProfileEntity } from "../../../entities/profile.entity";
import { RoleEntity } from "../../../entities/role.entity";

@Injectable()
export class UserEmployeeService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,

        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>,

        @InjectRepository(ProfileEntity)
        private readonly profileRepository: Repository<ProfileEntity>,

        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        private readonly userService: UserService,
        private readonly mailService: MailService,
    ) {}

    public async createUserEmployee(data: UserEmployeeInput): Promise<boolean> {
        const {
            email,
            mobile_phone,
            company_id,
            first_name,
            last_name,
            role: role_id,
            job_title,
        } = data;

        const password = this.generateSecurePassword();

        if (!email || !mobile_phone || !first_name || !last_name || !role_id || !job_title) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const company: CompanyEntity = await this.findCompany(queryRunner, company_id);
            const user: UserEntity = await this.userService.findOrCreateUser(queryRunner, {
                ...data,
                password,
            } as any);

            const role: RoleEntity = await this.roleRepository.findOne({ where: { id: role_id }});

            const profile: ProfileEntity = this.profileRepository.create({
                last_name,
                first_name,
                job_title,
                user: user,
                roles: [role],
                company: company,
                is_customer: false,
            });

            await queryRunner.manager.save(profile);

            await queryRunner.commitTransaction();
            await queryRunner.release();

            const mailInvite = {
                to: user.email,
                subject: 'Onversed Invite!',
                from: 'hello@onversed.com',
                text: 'Company invite!',
                html: MAIL_EMPLOYEE_INVITE
                    .replace(/{{company_name}}/g, company.name)
                    .replace(/{{full_name}}/g, `${first_name} ${last_name}`)
            };

            await this.mailService.send(mailInvite);

            const mailPassword = {
                to: user.email,
                subject: 'Our Onversed Password!',
                from: 'hello@onversed.com',
                text: 'Secure password',
                html: MAIL_WELCOME_TEAM
                    .replace(/{{password}}/g, password)
                    .replace(/{{company_name}}/g, company.name)
                    .replace(/{{full_name}}/g, `${first_name} ${last_name}`)
                    .replace(/{{url}}/g, 'http://localhost:4000/oauth/sign-in')
            };

            await this.mailService.send(mailPassword);

            return true;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            throw new BadRequestException('@ErrorNotCreate');
        }
    }

    public async removeEmployee(id: string): Promise<boolean> {
        try {
            const user: UserEntity = await this.repository.findOne({ where: { id }});

            if (!user) {
                throw new BadRequestException('@ErrorNotFound');
            }

            await this.repository.softDelete(user.id);

            return true;
        } catch (error) {
            throw new BadRequestException('@ErrorNotRemove');
        }
    }

    private async findCompany(queryRunner: QueryRunner, companyId: string): Promise<CompanyEntity> {
        const company: CompanyEntity = await this.companyRepository.findOne({ where: { id: companyId }});

        if (!company) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();

            throw new BadRequestException('La empresa no existe');
        }

        return company;
    }

    private generateSecurePassword(length = 12): string {
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*()_-+=<>?/[]{}|';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const allChars: string = uppercaseChars + lowercaseChars + numberChars + specialChars;

        let password = '';

        for (let i = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * allChars.length);

            password += allChars[randomIndex];
        }

        return password;
    }
}
