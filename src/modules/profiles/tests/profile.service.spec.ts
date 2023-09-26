import * as Upload from 'graphql-upload/Upload';

import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { ProfileService } from '../services';
import { ConfigService } from '@nestjs/config';
import { ProfileEntity } from "../../../entities/profile.entity";
import { UserEntity } from "../../../entities/user.entity";
import { RoleEntity } from "../../../entities/role.entity";
import { AssetsStorageService } from "../../../core/assets-storage/services";

describe('ProfileService', () => {
    let mocks: any;
    let service: ProfileService;

    beforeEach(async () => {
        createMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: getRepositoryToken(ProfileEntity),
                    useValue: mocks.repository.profile,
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mocks.repository.user,
                },
                {
                    provide: getRepositoryToken(RoleEntity),
                    useValue: mocks.repository.role,
                },
                {
                    provide: AssetsStorageService,
                    useValue: mocks.service.assetsStorage,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('some_api_key')
                    }
                }
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect((service as any).repository).toBeDefined();
        expect((service as any).userRepository).toBeDefined();
        expect((service as any).roleRepository).toBeDefined();
        expect((service as any).configService).toBeDefined();
        expect((service as any).assetsStorageService).toBeDefined();
    });

    describe('getTeams', () => {
        let userMock: Partial<UserEntity>;

        beforeEach(() => {
            userMock = {
                profiles: [
                    {
                        company: {
                            name: 'Test Company',
                        },
                    } as Partial<ProfileEntity>,
                ],
            } as any;
        });

        it('should return an array of teams', async () => {
            const profileMock = {
                company: {
                    name: 'Test Company',
                },
                user: {
                    id: 1,
                },
            } as any;

            mocks.repository.profile.find.mockResolvedValue([profileMock]);

            const result = await service.getTeams(userMock as UserEntity);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(profileMock.user.id);
            expect(result[0].company).toBe(profileMock.company);
        });

        it('should filter out profiles that are customers', async () => {
            const employeeProfileMock = {
                company: {
                    name: 'Test Company',
                },
                user: {
                    id: 2,
                },
                is_customer: false,
            } as any;

            const customerProfileMock = {
                company: {
                    name: 'Test Company',
                },
                user: {
                    id: 3,
                },
                is_customer: true,
            } as any;

            mocks.repository.profile.find.mockResolvedValue([employeeProfileMock, customerProfileMock]);

            const result = await service.getTeams(userMock as UserEntity);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(employeeProfileMock.user.id);
        });

        it('should return an empty array if no profiles match', async () => {
            mocks.repository.profile.find.mockResolvedValue([]);

            const result = await service.getTeams(userMock as UserEntity);

            expect(result).toHaveLength(0);
        });
    });

    describe('updateCustomerProfile', () => {
        let userMock: UserEntity;
        let profileMock: ProfileEntity;

        beforeEach(() => {
            userMock = {
                profiles: [
                    {
                        first_name: 'John',
                        last_name: 'Doe',
                        job_title: 'Engineer',
                    } as Partial<ProfileEntity>,
                ],
            } as UserEntity;

            profileMock = userMock.profiles[0] as ProfileEntity;
        });

        it('should update customer profile', async () => {
            const updateData = {
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
            };

            await service.updateCustomerProfile(updateData, userMock);

            expect(profileMock.first_name).toBe(updateData.first_name);
            expect(profileMock.last_name).toBe(updateData.last_name);
            expect(profileMock.job_title).toBe(updateData.job_title);

            expect(mocks.repository.profile.save).toHaveBeenCalledWith(profileMock);
        });

        it('should throw BadRequestException if update fails', async () => {
            mocks.repository.profile.save.mockRejectedValue(new Error());

            const updateData = {
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
            };

            await expect(service.updateCustomerProfile(updateData, userMock)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateEmployeeProfile', () => {
        let userMock: UserEntity;
        let profileMock: ProfileEntity;

        beforeEach(() => {
            userMock = {
                profiles: [
                    {
                        id: 1,
                        roles: [],
                    } as any,
                ],
            } as any;

            profileMock = userMock.profiles[0] as ProfileEntity;
        });

        it('should update employee profile', async () => {
            mocks.repository.user.findOne.mockResolvedValue(userMock);

            const roleMock = { id: 2, name: 'Employee' } as any;
            mocks.repository.role.findOne.mockResolvedValue(roleMock);

            const updateData = {
                email: 'new@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
                role: 2,
                mobile_phone: '+123456789',
            };

            await service.updateEmployeeProfile(updateData as any);

            expect(profileMock.first_name).toBe(updateData.first_name);
            expect(profileMock.last_name).toBe(updateData.last_name);
            expect(profileMock.job_title).toBe(updateData.job_title);
            expect(profileMock.roles).toEqual([roleMock]);

            expect(userMock.email).toBe(updateData.email);
            expect(userMock.mobile_phone).toBe(updateData.mobile_phone);

            expect(mocks.repository.profile.save).toHaveBeenCalledWith(profileMock);
            expect(mocks.repository.user.save).toHaveBeenCalledWith(userMock);
        });

        it('should throw BadRequestException if user is not found', async () => {
            mocks.repository.user.findOne.mockResolvedValue(undefined);

            const updateData = {
                email: 'new@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
                role: 2,
                mobile_phone: '+123456789',
            };

            await expect(service.updateEmployeeProfile(updateData as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if role is not found', async () => {
            mocks.repository.user.findOne.mockResolvedValue(userMock);
            mocks.repository.role.findOne.mockResolvedValue(undefined);

            const updateData = {
                email: 'new@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
                role: 2,
                mobile_phone: '+123456789',
            };

            const result = await service.updateEmployeeProfile(updateData as any);

            expect(result).toBe(true);
        });

        it('should throw BadRequestException if update fails', async () => {
            mocks.repository.user.findOne.mockResolvedValue(userMock);
            mocks.repository.role.findOne.mockResolvedValue({ id: 2, name: 'Employee' } as any);

            mocks.repository.profile.save.mockRejectedValue(new Error());

            const updateData = {
                email: 'new@example.com',
                first_name: 'Jane',
                last_name: 'Smith',
                job_title: 'Designer',
                role: 2,
                mobile_phone: '+123456789',
            };

            await expect(service.updateEmployeeProfile(updateData as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('uploadAvatar', () => {
        let uploadMock: Upload;
        let userMock: UserEntity;
        let profileMock: ProfileEntity;

        beforeEach(() => {
            userMock = {
                profiles: [
                    {
                        id: 1,
                    } as any,
                ],
            } as UserEntity;

            profileMock = userMock.profiles[0] as ProfileEntity;

            uploadMock = {
                filename: 'avatar.jpg',
                createReadStream: jest.fn(),
            } as any;

            mocks.repository.user.findOne.mockResolvedValue(userMock);
            mocks.service.assetsStorage.uploadFile.mockResolvedValue('avatar_id');
            mocks.service.assetsStorage.streamToBuffer.mockResolvedValue(Buffer.from('fileContent'));
        });

        it('should upload avatar and update profile', async () => {
            const result = await service.uploadAvatar(uploadMock, userMock);

            expect(result).toBe(`some_api_key/avatars/avatar.jpg`);
            expect(mocks.repository.profile.save).toHaveBeenCalledWith(profileMock);
        });

        it('should throw BadRequestException if upload fails', async () => {
            mocks.service.assetsStorage.uploadFile.mockRejectedValue(new Error());

            await expect(service.uploadAvatar(uploadMock, userMock)).rejects.toThrow(BadRequestException);
        });
    });

    function createMocks() {
        mocks = {
            repository: {
                profile: {
                    find: jest.fn(),
                    save: jest.fn(),
                },
                user: {
                    findOne: jest.fn(),
                    save: jest.fn(),
                },
                role: {
                    findOne: jest.fn(),
                }
            },
            service: {
                config: {
                    get: jest.fn(),
                },
                assetsStorage: {
                    streamToBuffer: jest.fn(),
                    uploadFile: jest.fn(),
                },
            },
        };
    }
});
