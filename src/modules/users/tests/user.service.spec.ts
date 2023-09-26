import { QueryRunner } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { UserService } from '../services';
import { SmsService } from '../../sms/services';
import { MailService } from '../../mail/services';
import { TokenService } from '../../tokens/services';
import { CodeVerificationService } from '../../code-verifications/services';
import { UserEntity } from "../../../entities/user.entity";
import { ProfileEntity } from "../../../entities/profile.entity";

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
    genSalt: jest.fn(),
}));

describe('UserService', () => {
    let mocks: any;
    let service: UserService;

    beforeEach(async () => {
        createMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    useValue: mocks.repository.user,
                    provide: getRepositoryToken(UserEntity),
                },
                {
                    useValue: mocks.repository.profile,
                    provide: getRepositoryToken(ProfileEntity),
                },
                {
                    provide: SmsService,
                    useValue: mocks.service.sms,
                },
                {
                    provide: MailService,
                    useValue: mocks.service.mail,
                },
                {
                    provide: TokenService,
                    useValue: mocks.service.token,
                }, {
                    provide: CodeVerificationService,
                    useValue: mocks.service.codeVerification,
                }, {
                    provide: I18nService,
                    useValue: mocks.service.i18n,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
        expect((service as any).smsService).toBeDefined();
        expect((service as any).i18nService).toBeDefined();
        expect((service as any).mailService).toBeDefined();
        expect((service as any).tokenService).toBeDefined();
        expect((service as any).profileRepository).toBeDefined();
        expect((service as any).codeVerificationService).toBeDefined();
    });


    describe('checkPassword', () => {
        it('should return true if password is valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.hash.mockReturnValue('testPassword');
            bcrypt.compare.mockResolvedValue(true);

            const mockUser = { password: await bcrypt.hash('testPassword', 10) };

            expect(await service.checkPassword('testPassword', mockUser as any)).toBeTruthy();
        });

        it('should throw BadRequestException if password is not valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.hash.mockReturnValue('testPassword');
            bcrypt.compare.mockResolvedValue(false);

            const mockUser = { password: await bcrypt.hash('testPassword', 10) };

            await expect(service.checkPassword('wrongPassword', mockUser as any))
                .rejects
                .toThrow(BadRequestException);

            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });
    });

    describe('changePassword', () => {
        it('should change the password', async () => {
            const inputData = { code: 'someCode', password: 'newPassword' };
            const mockUser = new UserEntity();
            mocks.service.codeVerification.getUserByCode.mockResolvedValue(mockUser);
            mocks.repository.user.save.mockResolvedValue(true);

            expect(await service.changePassword(inputData)).toBeTruthy();
            expect(mockUser.password).toBeDefined();
            expect(mocks.service.codeVerification.getUserByCode).toHaveBeenCalledWith(inputData.code, false, true);
            expect(mocks.repository.user.save).toHaveBeenCalledWith(mockUser);
        });
    });

    describe('updateEmail', () => {
        it('should update the email if data is valid', async () => {
            const inputData = {
                current_email: 'old@example.com',
                new_email: 'new@example.com',
                code: 'validCode'
            };
            const mockUser = { email: 'old@example.com' };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(true);
            mocks.repository.user.save.mockResolvedValue(true);

            expect(await service.updateEmail(inputData, mockUser as any)).toBeTruthy();
            expect(mockUser.email).toBe(inputData.new_email);
        });

        it('should throw BadRequestException if code is not valid', async () => {
            const inputData = {
                current_email: 'old@example.com',
                new_email: 'new@example.com',
                code: 'invalidCode'
            };
            const mockUser = { email: 'old@example.com' };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(false);

            await expect(service.updateEmail(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });

        it('should throw BadRequestException if current email does not match user email', async () => {
            const inputData = {
                current_email: 'different@example.com',
                new_email: 'new@example.com',
                code: 'validCode'
            };
            const mockUser = { email: 'old@example.com' };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(true);

            await expect(service.updateEmail(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });

        it('should throw BadRequestException if any error occurs', async () => {
            const inputData = {
                current_email: 'old@example.com',
                new_email: 'new@example.com',
                code: 'validCode'
            };
            const mockUser = { email: 'old@example.com' };

            mocks.service.codeVerification.removeCodeVerification.mockRejectedValue(new Error('Unexpected Error'));

            await expect(service.updateEmail(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotSendEmail');
        });
    });

    describe('updateMobilePhone', () => {
        it('should update the mobile phone and set is_confirmed to true if data is valid', async () => {
            const inputData = {
                current_mobile_phone: '1234567890',
                new_mobile_phone: '0987654321',
                code: 'validCode'
            };
            const mockUser = { mobile_phone: '1234567890', is_confirmed: false };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(true);
            mocks.repository.user.save.mockResolvedValue(true);

            expect(await service.updateMobilePhone(inputData, mockUser as any)).toBeTruthy();
            expect(mockUser.mobile_phone).toBe(inputData.new_mobile_phone);
            expect(mockUser.is_confirmed).toBe(true);
        });

        it('should throw BadRequestException if code is not valid', async () => {
            const inputData = {
                current_mobile_phone: '1234567890',
                new_mobile_phone: '0987654321',
                code: 'invalidCode'
            };
            const mockUser = { mobile_phone: '1234567890' };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(false);

            await expect(service.updateMobilePhone(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });

        it('should throw BadRequestException if current mobile phone does not match user mobile phone', async () => {
            const inputData = {
                current_mobile_phone: '1111111111',
                new_mobile_phone: '0987654321',
                code: 'validCode'
            };
            const mockUser = { mobile_phone: '1234567890' };

            mocks.service.codeVerification.removeCodeVerification.mockResolvedValue(true);

            await expect(service.updateMobilePhone(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });

        it('should throw BadRequestException if any error occurs', async () => {
            const inputData = {
                current_mobile_phone: '1234567890',
                new_mobile_phone: '0987654321',
                code: 'validCode'
            };
            const mockUser = { mobile_phone: '1234567890' };

            mocks.service.codeVerification.removeCodeVerification.mockRejectedValue(new Error('Unexpected Error'));

            await expect(service.updateMobilePhone(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotSendEmail');
        });
    });

    describe('updatePassword', () => {
        it('should update the password if current password is valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('oldPassword');

            const inputData = {
                current_password: 'oldPassword',
                new_password: 'newPassword'
            };

            const mockUser = { password: await bcrypt.hash('oldPassword', 10) };

            mocks.repository.user.save.mockResolvedValue(true);

            expect(await service.updatePassword(inputData, mockUser as any)).toBeTruthy();
        });

        it('should throw BadRequestException if current password is not valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.hash.mockReturnValue('oldPassword');
            bcrypt.compare.mockResolvedValue(false);

            const inputData = {
                current_password: 'wrongPassword',
                new_password: 'newPassword'
            };
            const mockUser = { password: await bcrypt.hash('oldPassword', 10) };

            await expect(service.updatePassword(inputData, mockUser as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });
    });

    describe('recoverPassword', () => {
        const MAIL_RESET_PASSWORD = 'Your reset link is: {{url}}';  // Make sure to define this at the top

        it('should send recovery mail if user with the given email exists', async () => {
            const inputData = { email: 'user@example.com' };
            const mockUser = { email: 'user@example.com' };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue('code123');
            mocks.service.mail.send.mockResolvedValue(true);

            expect(await service.recoverPassword(inputData)).toBeTruthy();
        });

        it('should throw BadRequestException if email is not provided', async () => {
            const inputData = {};

            await expect(service.recoverPassword(inputData as any)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });

        it('should throw BadRequestException if user with the given email does not exist', async () => {
            const inputData = { email: 'user@example.com' };

            mocks.repository.user.findOne.mockResolvedValue(null);

            await expect(service.recoverPassword(inputData)).rejects.toThrow(BadRequestException);
            expect(mocks.service.i18n.t).toHaveBeenCalledWith('@ErrorNotValid');
        });
    });

    describe('emailConfirmation', () => {
        it('should confirm the email, send a welcome mail and return a token', async () => {
            const mockUser = { email: 'user@example.com', profiles: [{ first_name: 'John', last_name: 'Doe' }] };

            mocks.service.codeVerification.getUserByCode.mockResolvedValue(mockUser);
            mocks.repository.user.save.mockResolvedValue(true);
            mocks.service.mail.send.mockResolvedValue(true);
            mocks.service.token.createToken.mockResolvedValue('token123');

            expect(await service.emailConfirmation('code123')).toBe('token123');
        });
    });

    describe('resendEmailConfirmation', () => {
        it('should resend the email confirmation if user exists', async () => {
            const mockUser = { email: 'user@example.com', profiles: [{ first_name: 'John', last_name: 'Doe' }] };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue('code123');
            mocks.service.mail.send.mockResolvedValue(true);

            expect(await service.resendEmailConfirmation('user@example.com')).toBeTruthy();
        });

        it('should throw BadRequestException if user does not exist', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            await expect(service.resendEmailConfirmation('user@example.com')).rejects.toThrow(BadRequestException);
        });
    });

    describe('smsConfirmation', () => {
        it('should confirm the sms and return a token', async () => {
            const mockUser = { mobile_phone: '123456789' };

            mocks.service.codeVerification.getUserByCode.mockResolvedValue(mockUser);
            mocks.repository.user.save.mockResolvedValue(true);
            mocks.service.token.createToken.mockResolvedValue('token123');

            expect(await service.smsConfirmation('code123')).toBe('token123');
        });
    });

    describe('resendSmsConfirmation', () => {
        it('should resend the sms confirmation if user exists', async () => {
            const mockUser = { mobile_phone: '123456789', profiles: [{ first_name: 'John', last_name: 'Doe' }] };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue('code123');
            mocks.service.sms.send.mockResolvedValue(true);

            expect(await service.resendSmsConfirmation('123456789')).toBeTruthy();
        });

        it('should throw BadRequestException if user does not exist', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            await expect(service.resendSmsConfirmation('123456789')).rejects.toThrow(BadRequestException);
        });
    });

    describe('checkUserByEmail', () => {
        it('should return a token if the email and password are valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            const mockUser = { email: 'user@example.com', password: 'hashedpassword', profiles: [{ is_generated: false }], is_active: true };

            bcrypt.compare.mockResolvedValue(true);
            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.token.createToken.mockResolvedValue('token123');

            const result = await service.checkUserByEmail({ email: 'user@example.com', password: 'password' });
            expect(result).toBe('token123');
        });

        it('should throw an error if no email or password is provided', async () => {
            await expect(service.checkUserByEmail({ email: '', password: '' }))
                .rejects
                .toThrowError('@ErrorNotValid');
        });

        it('should throw an error if the email is not associated with any user', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            await expect(service.checkUserByEmail({ email: 'noexist@example.com', password: 'password' }))
                .rejects
                .toThrowError('@ErrorNotValidCredential');
        });

        it('should throw an error if the provided password is incorrect', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            const mockUser = { email: 'user@example.com', password: 'hashedpassword', profiles: [{ is_generated: false }], is_active: true };

            bcrypt.compare.mockResolvedValue(false);
            mocks.repository.user.findOne.mockResolvedValue(mockUser);

            await expect(service.checkUserByEmail({ email: 'user@example.com', password: 'wrongpassword' }))
                .rejects
                .toThrowError('@ErrorNotValidCredential');
        });

        it('should activate a user with a generated profile and return limited user details', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');
            const mockUser = { email: 'user@example.com', password: 'hashedpassword', profiles: [{ is_generated: true }], is_active: false, mobile_phone: '123456789', is_confirmed: false };

            bcrypt.compare.mockResolvedValue(true);
            mocks.repository.user.findOne.mockResolvedValue(mockUser);

            const result = await service.checkUserByEmail({ email: 'user@example.com', password: 'hashedpassword' });

            expect(result).toBeUndefined();
        });

        it('should activate a user with is not generated profile and return limited user details', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');
            const mockUser = { email: 'user@example.com', password: 'hashedpassword', profiles: [{ is_generated: false }], is_active: false, mobile_phone: '123456789', is_confirmed: false };

            bcrypt.compare.mockResolvedValue(true);
            mocks.repository.user.findOne.mockResolvedValue(mockUser);

            const result = await service.checkUserByEmail({ email: 'user@example.com', password: 'hashedpassword' });

            expect(result).toEqual({
                accessToken: '',
                refreshToken: '',
                mobile_phone: '123456789',
                is_confirmed: false,
                has_mobile_phone: true
            });
        });

        it('should resend the email confirmation and return limited user details if the user is not active', async () => {
            const mockUser = { email: 'user@example.com', password: 'hashedpassword', profiles: [{ is_generated: false }], is_active: false, mobile_phone: '123456789', is_confirmed: false };
            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.bcrypt.compare.mockResolvedValue(true);

            const mockResendEmailConfirmation = jest.spyOn(service, 'resendEmailConfirmation');

            mockResendEmailConfirmation.mockResolvedValue(true);

            const result = await service.checkUserByEmail({ email: 'user@example.com', password: 'password' });
            expect(result).toEqual({
                accessToken: '',
                refreshToken: '',
                mobile_phone: '123456789',
                is_confirmed: false,
                has_mobile_phone: true
            });
        });

        it('should handle unexpected errors gracefully', async () => {
            mocks.repository.user.findOne.mockRejectedValue(new Error('Unexpected database error'));

            await expect(service.checkUserByEmail({ email: 'user@example.com', password: 'password' }))
                .rejects
                .toThrowError('Unexpected database error');
        });
    });

    describe('checkUserByMobilePhone', () => {
        it('should send a verification code if mobile phone is valid', async () => {
            const mockUser = { mobile_phone: '123456789', is_confirmed: true };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue('code123');
            mocks.service.sms.send.mockResolvedValue(true);

            const result = await service.checkUserByMobilePhone({ mobile_phone: '123456789' });
            expect(result).toBeTruthy();
        });

        it('should throw an error if no mobile_phone is provided', async () => {
            await expect(service.checkUserByMobilePhone({ mobile_phone: '' }))
                .rejects
                .toThrowError('@ErrorNotValid');
        });

        it('should throw an error if mobile phone is not associated with any user', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            await expect(service.checkUserByMobilePhone({ mobile_phone: '987654321' }))
                .rejects
                .toThrowError('@ErrorMobilePhone');
        });

        it('should throw an error if users mobile phone is not confirmed', async () => {
            const mockUser = { mobile_phone: '123456789', is_confirmed: false };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);

            await expect(service.checkUserByMobilePhone({ mobile_phone: '123456789' }))
                .rejects
                .toThrowError('@ErrorMobilePhone');
        });

        it('should handle unexpected errors gracefully', async () => {
            mocks.repository.user.findOne.mockRejectedValue(new Error('Unexpected database error'));

            await expect(service.checkUserByMobilePhone({ mobile_phone: '123456789' }))
                .rejects
                .toThrowError('Unexpected database error');
        });

        it('should throw an error if SMS sending fails', async () => {
            const mockUser = { mobile_phone: '123456789', is_confirmed: true };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue('code123');
            mocks.service.sms.send.mockRejectedValue(new Error('SMS sending failed'));

            await expect(service.checkUserByMobilePhone({ mobile_phone: '123456789' }))
                .rejects
                .toThrowError('SMS sending failed');
        });
    });


    describe('checkUserByMobileCode', () => {
        it('should return a token if mobile code is valid', async () => {
            const mockUser = { mobile_phone: '123456789' };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.getUserByCode.mockResolvedValue(mockUser);
            mocks.service.token.createToken.mockResolvedValue('token123');

            const result = await service.checkUserByMobileCode({ mobile_phone: '123456789', code: 'code123' });
            expect(result).toBe('token123');
        });

        it('should throw an error if user is not found', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            const result = await service.checkUserByMobileCode({ mobile_phone: '123456789', code: 'code123' });

            expect(result).toBe(undefined);
        });

        it('should throw an error if code is not valid', async () => {
            const mockUser = { mobile_phone: '123456789' };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.getUserByCode.mockRejectedValue(new Error('Invalid code'));

            await expect(service.checkUserByMobileCode({ mobile_phone: '123456789', code: 'wrongcode' }))
                .rejects
                .toThrowError('Invalid code');
        });

        it('should throw an error if the provided mobile phone is not associated with any user', async () => {
            mocks.repository.user.findOne.mockResolvedValue(null);

            const result = await service.checkUserByMobileCode({ mobile_phone: '987654321', code: 'code123' });

            expect(result).toBe(undefined);
        });

        it('should throw an error if no mobile_phone is provided', async () => {
            const result = await service.checkUserByMobileCode({ mobile_phone: '', code: 'code123' });

            expect(result).toBe(undefined);
        });

        it('should throw an error if no code is provided', async () => {
            const result = await service.checkUserByMobileCode({ mobile_phone: '123456789', code: '' });
            expect(result).toBe(undefined);
        });

        it('should handle unexpected errors gracefully', async () => {
            mocks.repository.user.findOne.mockRejectedValue(new Error('Unexpected database error'));

            await expect(service.checkUserByMobileCode({ mobile_phone: '123456789', code: 'code123' }))
                .rejects
                .toThrowError('Unexpected database error');
        });

        it('should throw an error if token creation fails', async () => {
            const mockUser = { mobile_phone: '123456789' };

            mocks.repository.user.findOne.mockResolvedValue(mockUser);
            mocks.service.codeVerification.getUserByCode.mockResolvedValue(mockUser);
            mocks.service.token.createToken.mockRejectedValue(new Error('Token creation failed'));

            await expect(service.checkUserByMobileCode({ mobile_phone: '123456789', code: 'code123' }))
                .rejects
                .toThrowError('Token creation failed');
        });
    });

    describe('findOrCreateUser', () => {
        let queryRunner: QueryRunner;

        beforeEach(() => {
            queryRunner = {
                manager: {
                    save: jest.fn(),
                },
            } as any;
        });

        it('should create and return a new user if the user does not exist by email or mobile_phone', async () => {
            const mockData = {
                lang: 'en',
                email: 'user@example.com',
                password: 'password',
                mobile_phone: '123456789',
            };

            const mockHashedPassword = 'hashedpassword';

            mocks.repository.user.findOne.mockResolvedValue(null);

            const newUser: UserEntity = {
                ...mockData,
                password: mockHashedPassword,
            } as any;

            mocks.repository.user.create.mockReturnValue(newUser);

            const result = await service.findOrCreateUser(queryRunner as any, mockData as any);
            expect(result).toEqual(newUser);
        });

        it('should throw a ConflictException if a user with the same email already exists', async () => {
            const mockData = {
                lang: 'en',
                email: 'user@example.com',
                password: 'password',
                mobile_phone: '123456789',
            };

            const existingUser = {
                lang: 'en',
                email: 'user@example.com',
                password: 'hashedpassword',
                mobile_phone: '987654321',
            };

            mocks.repository.user.findOne.mockResolvedValue(existingUser);

            await expect(service.findOrCreateUser(queryRunner as any, mockData as any))
                .rejects
                .toThrowError(ConflictException);
        });

        it('should throw a ConflictException if a user with the same mobile_phone already exists', async () => {
            const mockData = {
                lang: 'en',
                email: 'anotheruser@example.com',
                password: 'password',
                mobile_phone: '123456789',
            };

            const existingUser = {
                lang: 'en',
                email: 'user@example.com',
                password: 'hashedpassword',
                mobile_phone: '123456789',
            };

            mocks.repository.user.findOne.mockResolvedValue(existingUser);

            await expect(service.findOrCreateUser(queryRunner as any, mockData as any))
                .rejects
                .toThrowError(ConflictException);
        });

        it('should handle unexpected database errors gracefully', async () => {
            const mockData = {
                lang: 'en',
                email: 'user@example.com',
                password: 'password',
                mobile_phone: '123456789',
            };

            mocks.repository.user.findOne.mockRejectedValue(new Error('Unexpected database error'));

            await expect(service.findOrCreateUser(queryRunner as any, mockData as any))
                .rejects
                .toThrowError('Unexpected database error');
        });

        it('should handle hashing errors gracefully', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

            const mockData = {
                lang: 'en',
                email: 'user@example.com',
                password: 'password',
                mobile_phone: '123456789',
            };

            await expect(service.findOrCreateUser(queryRunner as any, mockData as any))
                .rejects
                .toThrowError('Hashing failed');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function createMocks() {
        mocks = {
            service: {
                i18n: {
                    t: jest.fn((key) => key),
                },
                codeVerification: {
                    getUserByCode: jest.fn(),
                    createCodeVerification: jest.fn(),
                    removeCodeVerification: jest.fn(),
                },
                token: {
                    createToken: jest.fn(),
                },
                mail: {
                    send: jest.fn(),
                },
                sms: {
                    send: jest.fn(),
                },
                bcrypt: {
                    compare: jest.fn(),
                }
            },
            repository: {
                user: {
                    findOne: jest.fn(),
                    save: jest.fn(),
                    create: jest.fn(),
                },
                profile: {
                    save: jest.fn(),
                }
            }
        };
    }
});

