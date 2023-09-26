import { QueryRunner } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SmsService } from '../../sms/services';
import { MailService } from '../../mail/services';
import { TokenService } from '../../tokens/services';
import { UserService, UserCustomerService } from '../services';
import { CodeVerificationService } from '../../code-verifications/services';
import { UserCustomerInput } from '../gql';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserEntity } from "../../../entities/user.entity";
import { CompanyEntity } from "../../../entities/company.entity";
import { ProfileEntity } from "../../../entities/profile.entity";

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

describe('UserCustomerService', () => {
    let mocks;
    let service: UserCustomerService;

    beforeEach(async () => {
        createMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserCustomerService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mocks.repository.user,
                },
                {
                    provide: getRepositoryToken(CompanyEntity),
                    useValue: mocks.repository.company,
                },
                {
                    provide: getRepositoryToken(ProfileEntity),
                    useValue: mocks.repository.profile,
                },
                {
                    provide: SmsService,
                    useValue: mocks.service.sms,
                },
                {
                    provide: UserService,
                    useValue: mocks.service.userService,
                },
                {
                    provide: MailService,
                    useValue: mocks.service.mail,
                },
                {
                    provide: TokenService,
                    useValue: mocks.service.token,
                },
                {
                    provide: CodeVerificationService,
                    useValue: mocks.service.codeVerification,
                },
            ],
        }).compile();

        service = module.get<UserCustomerService>(UserCustomerService);
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
        expect((service as any).repository).toBeDefined();
        expect((service as any).companyRepository).toBeDefined();
        expect((service as any).profileRepository).toBeDefined();
        expect((service as any).smsService).toBeDefined();
        expect((service as any).userService).toBeDefined();
        expect((service as any).mailService).toBeDefined();
        expect((service as any).tokenService).toBeDefined();
        expect((service as any).codeVerificationService).toBeDefined();
    });

    describe('createUserCustomer', () => {
        it('should throw BadRequestException if required fields are missing', async () => {
            await expect(service.createUserCustomer({} as UserCustomerInput)).rejects.toThrow(BadRequestException);
        });

        it('should create a new user and company successfully', async () => {
            mocks.service.token.createToken.mockResolvedValue({});
            mocks.repository.company.findOne.mockResolvedValue(null);
            mocks.service.userService.findOrCreateUser.mockResolvedValue(new UserEntity());
            mocks.service.codeVerification.createCodeVerification.mockResolvedValue("12345");

            const input: UserCustomerInput = {
                email: 'test@onversed.com',
                password: 'password',
                last_name: 'Doe',
                first_name: 'John',
                company_name: 'Onversed',
                mobile_phone: '+123456789',
            } as any;

            const tokens = await service.createUserCustomer(input);

            expect(mocks.service.mail.send).toBeCalled();
            expect(mocks.service.sms.send).toBeCalled();
            expect(tokens).toBeDefined();
        });

    });

    describe('removeCustomer', () => {
        it('should throw BadRequestException if password is invalid', async () => {
            mocks.service.bcrypt.compare.mockResolvedValue(false);
            const fakeUser = new UserEntity();
            fakeUser.password = 'hashedPassword';

            await expect(service.removeCustomer('wrongPassword', fakeUser)).rejects.toThrow(BadRequestException);
        });

        it('should remove customer successfully if password is valid', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bcrypt = require('bcryptjs');

            bcrypt.compare.mockResolvedValue(true);
            mocks.service.bcrypt.compare.mockResolvedValue(true);

            const fakeUser: any = new UserEntity();

            fakeUser.id = 1;
            fakeUser.password = 'hashedPassword';

            const result = await service.removeCustomer('correctPassword', fakeUser);

            expect(mocks.repository.user.softDelete).toBeCalledWith(fakeUser.id);
            expect(result).toBeTruthy();
        });

    });

    describe('findOrCreateCompany', () => {
        it('should throw ConflictException if company exists', async () => {
            mocks.repository.company.findOne.mockResolvedValue(new CompanyEntity());

            await expect(service['findOrCreateCompany'](mocks.queryRunner, 'Onversed')).rejects.toThrow(ConflictException);
        });

        it('should create a new company if it does not exist', async () => {
            const mockcompany: any = new CompanyEntity();

            mockcompany.name = 'NewCompany';

            mocks.repository.company.findOne.mockResolvedValue(null);
            mocks.repository.company.create.mockReturnValue(mockcompany);

            const company = await service['findOrCreateCompany'](mocks.queryRunner, 'NewCompany');

            expect(mocks.repository.company.create).toBeCalledWith({ name: 'NewCompany' });
            expect(company).toBeDefined();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function createMocks() {
        const queryRunner = {
            manager: {
                save: jest.fn().mockImplementation(entity => entity),
            },
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
        };

        mocks = {
            queryRunner,
            service: {
                sms: {
                    send: jest.fn(),
                },
                userService: {
                    findOrCreateUser: jest.fn(),
                },
                mail: {
                    send: jest.fn(),
                },
                token: {
                    createToken: jest.fn(),
                },
                codeVerification: {
                    createCodeVerification: jest.fn(),
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
                    softDelete: jest.fn(),
                    manager: {
                        connection: {
                            createQueryRunner: jest.fn().mockReturnValue({ ...queryRunner }),
                        },
                    },
                },
                company: {
                    findOne: jest.fn(),
                    save: jest.fn(),
                    create: jest.fn(),
                },
                profile: {
                    save: jest.fn(),
                    create: jest.fn(),
                }
            }
        };
    }
});
