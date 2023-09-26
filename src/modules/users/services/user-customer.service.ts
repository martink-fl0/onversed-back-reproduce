import * as bcrypt from 'bcryptjs';

import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { UserService } from './user.service';
import { SmsService } from '../../sms/services';
import { MAIL_CODE } from '../../mail/templates';
import { MailService } from '../../mail/services';
import { TokenService } from '../../tokens/services';
import { UserCustomerInput, UserTokens } from '../gql';
import { CodeVerificationService } from '../../code-verifications/services';
import { UserEntity } from "../../../entities/user.entity";
import { CompanyEntity } from "../../../entities/company.entity";
import { ProfileEntity } from "../../../entities/profile.entity";

@Injectable()
export class UserCustomerService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,

        @InjectRepository(CompanyEntity)
        private readonly companyRepository: Repository<CompanyEntity>,

        @InjectRepository(ProfileEntity)
        private readonly profileRepository: Repository<ProfileEntity>,

        private readonly smsService: SmsService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
        private readonly codeVerificationService: CodeVerificationService,
    ) {
    }

    public async createUserCustomer(data: UserCustomerInput): Promise<UserTokens> {
        const {
            email,
            password,
            last_name,
            first_name,
            company_name,
            mobile_phone,
        } = data;

        if (!email || !password || !company_name || !first_name || !last_name) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();
        let user: UserEntity;
        let company: CompanyEntity;

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            company = await this.findOrCreateCompany(queryRunner, company_name);
            user = await this.userService.findOrCreateUser(queryRunner, data);

            const profile: ProfileEntity = this.profileRepository.create({
                last_name,
                first_name,
                user: user,
                company: company,
                is_customer: true,
            });

            await queryRunner.manager.save(profile);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('@ErrorNotCreate');
        } finally {
            await queryRunner.release();
        }

        try {
            let code: string = await this.codeVerificationService.createCodeVerification(user, false, true);

            const mail = {
                to: user.email,
                subject: 'Confirm E-mail!',
                from: 'hello@onversed.com',
                text: 'Need our confirmation',
                html: MAIL_CODE.replace(/{{code}}/g, code)
                    .replace(/{{full_name}}/g, `${first_name} ${last_name}`)
            };

            await this.mailService.send(mail);

            code = await this.codeVerificationService.createCodeVerification(user, true, false);

            await this.smsService.send({
                mobile_phone,
                body: `Our Onversed Code is: ${code}`,
            });

            return await this.tokenService.createToken(user);
        } catch (error) {
            console.error(error);
            throw new BadRequestException('@ErrorNoSendEmail');
        }
    }

    public async removeCustomer(password: string, user: UserEntity): Promise<boolean> {
        try {
            const isValid: boolean = await bcrypt.compare(password, user.password);

            if (!isValid) {
                throw new BadRequestException('@ErrorNotValid');
            }

            await this.repository.softDelete(user.id);

            return true;
        } catch (error) {
            throw new BadRequestException('@ErrorNotRemove');
        }
    }

    private async findOrCreateCompany(queryRunner: QueryRunner, name: string): Promise<CompanyEntity> {
        const company: CompanyEntity = await this.companyRepository.findOne({ where: { name }});

        if (!company) {
            const newCompany: CompanyEntity = this.companyRepository.create({ name });

            await queryRunner.manager.save(newCompany);

            return newCompany;
        } else {
            throw new ConflictException('La empresa ya existe');
        }
    }
}
