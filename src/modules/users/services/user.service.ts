import * as bcrypt from 'bcryptjs';

import { I18nService } from 'nestjs-i18n';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';


import { SmsService } from '../../sms/services';
import { MailService } from '../../mail/services';
import { TokenService } from '../../tokens/services';
import { CodeVerificationService } from '../../code-verifications/services';
import { MAIL_CODE, MAIL_RESET_PASSWORD, MAIL_WELCOME } from '../../mail/templates';

import {
    UserChangePasswordInput, UserCustomerInput,
    UserLoginEmailInput, UserLoginMobileCodeInput,
    UserLoginMobilePhoneInput, UserRecoverPasswordInput,
    UserTokens, UserUpdateEmailInput, UserUpdateMobilePhoneInput, UserUpdatePasswordInput
} from '../gql';
import { ProfileEntity } from "../../../entities/profile.entity";
import { UserEntity } from "../../../entities/user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,

        @InjectRepository(ProfileEntity)
        private readonly profileRepository: Repository<ProfileEntity>,

        private readonly smsService: SmsService,
        private readonly i18nService: I18nService,
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
        private readonly codeVerificationService: CodeVerificationService,
    ) {}

    public async checkPassword(password: string, current_user: UserEntity): Promise<boolean> {
        const isValid: boolean = await bcrypt.compare(password, current_user.password);

        if (!isValid) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        return true;
    }

    public async changePassword(data: UserChangePasswordInput): Promise<boolean> {
        const { code, password } = data;

        const user: UserEntity = await this.codeVerificationService.getUserByCode(code, false, true);

        const salt: string = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await this.repository.save(user);

        return true;
    }

    public async updateEmail(data: UserUpdateEmailInput, user: UserEntity): Promise<boolean> {
        const { current_email, new_email, code } = data;

        try {
            const hasCode: boolean = await this.codeVerificationService.removeCodeVerification(code);

            if (!hasCode) {
                throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
            }

            if (current_email !== user.email) {
                throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
            }

            user.email = new_email;

            await this.repository.save(user);

            return true;
        } catch (error) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotSendEmail'));
        }
    }

    public async updateMobilePhone(data: UserUpdateMobilePhoneInput, user: UserEntity): Promise<boolean> {
        const { current_mobile_phone, new_mobile_phone, code } = data;

        try {
            const hasCode: boolean = await this.codeVerificationService.removeCodeVerification(code);

            if (!hasCode) {
                throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
            }

            if (current_mobile_phone !== user.mobile_phone) {
                throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
            }

            user.is_confirmed = true;
            user.mobile_phone = new_mobile_phone;

            await this.repository.save(user);

            return true;
        } catch (error) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotSendEmail'));
        }
    }

    public async updatePassword(data: UserUpdatePasswordInput, user: UserEntity): Promise<boolean> {
        const { current_password, new_password } = data;

        const isValid: boolean = await bcrypt.compare(current_password, user.password);

        if (!isValid) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const salt: string = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(new_password, salt);

        await this.repository.save(user);

        return true;
    }

    public async recoverPassword(data: UserRecoverPasswordInput): Promise<boolean> {
        const { email } = data;

        if (!email) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const user: UserEntity = await this.repository.findOne({
            where: {
                email,
            }, relations: [
                'profiles',
            ],
        });

        if (!user) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const code: string = await this.codeVerificationService.createCodeVerification(user, false, true);

        const text: string = this.i18nService.t('Forgot Our Password?');
        const subject: string = this.i18nService.t('Recover Password');

        const mail = {
            text,
            subject,
            to: user.email,
            from: 'hello@onversed.com',
            html: MAIL_RESET_PASSWORD.replace(/{{url}}/g, `http://localhost:4000/oauth/change-password/${code}`),
        };

        await this.mailService.send(mail);

        return true;
    }

    public async emailConfirmation(code: string): Promise<UserTokens> {
        const user: UserEntity = await this.codeVerificationService.getUserByCode(code, false, true);

        user.is_active = true;

        await this.repository.save(user);

        const text: string = this.i18nService.t('Hello!');
        const subject: string = this.i18nService.t('Welcome To Onversed');

        const mail = {
            text,
            subject,
            to: user.email,
            from: 'hello@onversed.com',
            html: MAIL_WELCOME.replace(/{{url}}/g, 'http://localhost:4000')
                .replace(/{{full_name}}/g, `${user.profiles[0].first_name} ${user.profiles[0].last_name}`)
        };

        await this.mailService.send(mail);

        return await this.tokenService.createToken(user);
    }

    public async resendEmailConfirmation(email: string): Promise<boolean> {
        const user: UserEntity = await this.repository.findOne({
            where: {
                email,
            }, relations: [
                'profiles',
            ],
        });

        if (!user) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const code: string = await this.codeVerificationService.createCodeVerification(user, false, true);

        const text: string = this.i18nService.t('Hello');
        const subject: string = this.i18nService.t('Confirm Our Email');

        const mail = {
            text,
            subject,
            to: user.email,
            from: 'hello@onversed.com',
            html: MAIL_CODE.replace(/{{code}}/g, code)
                .replace(/{{full_name}}/g, `${user.profiles[0].first_name} ${user.profiles[0].last_name}`),
        };

        await this.mailService.send(mail);

        return true;
    }

    public async smsConfirmation(code: string): Promise<UserTokens> {
        const user: UserEntity = await this.codeVerificationService.getUserByCode(code, true, false);

        user.is_confirmed = true;

        await this.repository.save(user);

        return await this.tokenService.createToken(user);
    }

    public async resendSmsConfirmation(mobile_phone: string): Promise<boolean> {
        const user: UserEntity = await this.repository.findOne({
            where: {
                mobile_phone,
            }, relations: [
                'profiles',
            ],
        });

        if (!user) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const code: string = await this.codeVerificationService.createCodeVerification(user, true, false);

        await this.smsService.send({
            mobile_phone,
            body: `Our Onversed Code is: ${code}`,
        });

        return true;
    }

    public async checkUserByEmail(data: UserLoginEmailInput): Promise<UserTokens> {
        const { email, password } = data;

        if (!email || !password) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const user: UserEntity = await this.repository.findOne({
            where: {
                email,
            }, relations: [ 'profiles', ],
        });

        if (!user) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValidCredential'));
        }

        if (user.profiles?.[0].is_generated) {
            user.is_active = true;
            const profile: ProfileEntity = user.profiles[0];

            profile.is_generated = false;

            await this.repository.save(user);
            await this.profileRepository.save(profile);
        } else if (!user.is_active) {
            await this.resendEmailConfirmation(email);

            return {
                accessToken: '',
                refreshToken: '',
                mobile_phone: user.mobile_phone,
                is_confirmed: user.is_confirmed,
                has_mobile_phone: !!user.mobile_phone,
            };
        }

        const isValid: boolean = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValidCredential'));
        }

        return await this.tokenService.createToken(user);
    }

    public async checkUserByMobilePhone(data: UserLoginMobilePhoneInput): Promise<boolean> {
        const { mobile_phone } = data;

        if (!mobile_phone) {
            throw new BadRequestException(this.i18nService.t('@ErrorNotValid'));
        }

        const user: UserEntity = await this.repository.findOne({
            where: {
                mobile_phone,
            }, relations: [ 'profiles', ],
        });

        if (!user || !user.is_confirmed) {
            throw new BadRequestException(this.i18nService.t('@ErrorMobilePhone'));
        }

        const code: string = await this.codeVerificationService.createCodeVerification(user, true, false);

        await this.smsService.send({
            mobile_phone,
            body: `Our Onversed Code is: ${code}`,
        });

        return true;
    }

    public async checkUserByMobileCode(data: UserLoginMobileCodeInput): Promise<UserTokens> {
        const user: UserEntity = await this.repository.findOne({
            where: {
                mobile_phone: data.mobile_phone,
            },
            relations: [
                'profiles',
            ],

        });

        await this.codeVerificationService.getUserByCode(data.code, true, false);

        return await this.tokenService.createToken(user);
    }

    public async findOrCreateUser(queryRunner: QueryRunner, data: UserCustomerInput): Promise<UserEntity> {
        const { lang, email, password, mobile_phone } = data;

        const user: UserEntity = await this.repository.findOne({
            where: [ { email }, { mobile_phone }, ]
        });

        if (!user) {
            const newUser: UserEntity = this.repository.create({
                lang,
                email,
                mobile_phone,
                password: await bcrypt.hash(password, 10),
            });

            await queryRunner.manager.save(newUser);

            return newUser;
        } else {
            throw new ConflictException(this.i18nService.t('@ErrorYetExist'));
        }
    }
}
