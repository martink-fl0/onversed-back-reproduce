import { QueryRunner } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../../mail/services';
import { UserService, UserEmployeeService } from '../services';
import { UserEntity } from "../../../entities/user.entity";
import { CompanyEntity } from "../../../entities/company.entity";
import { ProfileEntity } from "../../../entities/profile.entity";
import { RoleEntity } from "../../../entities/role.entity";

describe('UserEmployeeService', () => {
    let mocks: any;
    let service: UserEmployeeService;

    beforeEach(async () => {
        createMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserEmployeeService,
                {
                    useValue: mocks.repository.user,
                    provide: getRepositoryToken(UserEntity),
                },
                {
                    useValue: mocks.repository.company,
                    provide: getRepositoryToken(CompanyEntity),
                },
                {
                    useValue: mocks.repository.profile,
                    provide: getRepositoryToken(ProfileEntity),
                },
                {
                    useValue: mocks.repository.role,
                    provide: getRepositoryToken(RoleEntity),
                },
                {
                    provide: UserService,
                    useValue: mocks.service.user,
                },
                {
                    provide: MailService,
                    useValue: mocks.service.mail,
                }
            ],
        }).compile();

        service = module.get<UserEmployeeService>(UserEmployeeService);
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
        expect((service as any).userService).toBeDefined();
        expect((service as any).mailService).toBeDefined();
        expect((service as any).repository).toBeDefined();
        expect((service as any).companyRepository).toBeDefined();
        expect((service as any).profileRepository).toBeDefined();
        expect((service as any).roleRepository).toBeDefined();
    });

    describe('createUserEmployee', () => {
        const MOCK_USER_EMPLOYEE_INPUT: any = {
            email: "test@example.com",
            mobile_phone: "+1234567890",
            company_id: "123",
            first_name: "John",
            last_name: "Doe",
            role: "456",
            job_title: "Developer"
        };

        it('should throw BadRequestException if any of the required fields is missing', async () => {
            const data = { ...MOCK_USER_EMPLOYEE_INPUT, email: '' }; // Here we remove the email to simulate an error
            await expect(service.createUserEmployee(data)).rejects.toThrow(BadRequestException);
        });

        it('should create a new user employee with valid data', async () => {
            mocks.repository.company.findOne.mockResolvedValue(new CompanyEntity());
            mocks.repository.role.findOne.mockResolvedValue(new RoleEntity());
            mocks.service.user.findOrCreateUser.mockResolvedValue(new UserEntity());
            mocks.service.mail.send.mockResolvedValue(true);

            await expect(service.createUserEmployee(MOCK_USER_EMPLOYEE_INPUT)).resolves.toBeTruthy();
        });

        it('should throw BadRequestException if company not found', async () => {
            mocks.repository.company.findOne.mockResolvedValue(undefined);

            await expect(service.createUserEmployee(MOCK_USER_EMPLOYEE_INPUT)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if there is an error during transaction', async () => {
            mocks.repository.company.findOne.mockResolvedValue(new CompanyEntity());
            mocks.repository.role.findOne.mockResolvedValue(new RoleEntity());
            mocks.service.user.findOrCreateUser.mockRejectedValue(new Error('Test Error'));

            await expect(service.createUserEmployee(MOCK_USER_EMPLOYEE_INPUT)).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeEmployee', () => {
        it('should remove an employee successfully', async () => {
            const MOCK_USER_ID = '12345';
            mocks.repository.user.findOne.mockResolvedValue(new UserEntity());
            mocks.repository.user.softDelete.mockResolvedValue({});

            const result = await service.removeEmployee(MOCK_USER_ID);
            expect(result).toBeTruthy();
        });

        it('should throw BadRequestException when trying to remove an employee that does not exist', async () => {
            mocks.repository.user.findOne.mockResolvedValue(undefined);

            await expect(service.removeEmployee('nonexistentId')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if there is an error during the removal process', async () => {
            mocks.repository.user.findOne.mockResolvedValue(new UserEntity());
            mocks.repository.user.softDelete.mockRejectedValue(new Error('Test Error'));

            await expect(service.removeEmployee('12345')).rejects.toThrow(BadRequestException);
        });
    });

    describe('findCompany', () => {
        it('should successfully find and return a company', async () => {
            const MOCK_COMPANY = {
                id: '12345',
            } as CompanyEntity;

            mocks.repository.company.findOne.mockResolvedValue(MOCK_COMPANY);

            const result = await (service as any).findCompany(mocks.queryrunner, '12345');

            expect(result).toBe(MOCK_COMPANY);
        });

        it('should throw BadRequestException if company is not found', async () => {
            const MOCK_COMPANY_ID = '12345';
            mocks.repository.company.findOne.mockResolvedValue(undefined);

            await expect(service.createUserEmployee({ company_id: MOCK_COMPANY_ID } as any))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    describe('generateSecurePassword', () => {
        it('should generate a secure password of correct length', async () => {
            const result: string = (service as any).generateSecurePassword();

            expect(result.length).toBe(12);
        });
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
                user: {
                    findOrCreateUser: jest.fn(),
                },
                mail: {
                    send: jest.fn(),
                }
            },
            repository: {
                user: {
                    findOne: jest.fn(),
                    softDelete: jest.fn(),
                    manager: {
                        connection: {
                            createQueryRunner: jest.fn().mockReturnValue({ ...queryRunner }),
                        },
                    },
                },
                company: {
                    findOne: jest.fn((entity) => entity),
                },
                profile: {
                    create: jest.fn(),
                    save: jest.fn(),
                },
                role: {
                    findOne: jest.fn(),
                }
            }
        };
    }
});
