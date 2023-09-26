import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CodeVerificationEntity, UserEntity } from '@onversed/back';

import { CodeVerificationService } from '../services';

describe('CodeVerificationService', () => {
    let service: CodeVerificationService;
    let codeVerificationRepositoryMock: jest.Mocked<Repository<CodeVerificationEntity>>;
    let userRepositoryMock: jest.Mocked<Repository<UserEntity>>;

    beforeEach(async () => {
        const repoMockFactory = jest.fn(() => ({
            findOne: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
        }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CodeVerificationService,
                {
                    provide: getRepositoryToken(CodeVerificationEntity),
                    useFactory: repoMockFactory,
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useFactory: repoMockFactory,
                },
            ],
        }).compile();

        service = module.get<CodeVerificationService>(CodeVerificationService);
        codeVerificationRepositoryMock = module.get(getRepositoryToken(CodeVerificationEntity));
        userRepositoryMock = module.get(getRepositoryToken(UserEntity));
    });

    it('Should be defined', () => {
        expect(service).toBeDefined();
        expect((service as any).repository).toBeDefined();
        expect((service as any).userRepository).toBeDefined();
    });

    describe('getUserByCode', () => {
        const testCode = '123456';
        const testUserEmail = 'test@user.com';

        const mockCodeVerificationEntity = {
            id: 1,
            code: testCode,
            is_sms: false,
            is_email: true,
            user: { email: testUserEmail }
        };

        const mockUserEntity = {
            email: testUserEmail,
            profiles: []
        };

        it('should throw BadRequestException if no code is provided', async () => {
            await expect(service.getUserByCode('')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if code is not found in the repository', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(undefined);

            await expect(service.getUserByCode(testCode)).rejects.toThrow(BadRequestException);
            await expect(service.getUserByCode(testCode)).rejects.toThrow('@ErrorNotValid');
        });

        it('should throw BadRequestException if user is not found in the repository', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(mockCodeVerificationEntity as any);
            userRepositoryMock.findOne.mockResolvedValueOnce(undefined);

            await expect(service.getUserByCode(testCode)).rejects.toThrow(BadRequestException);
        });

        it('should return user if everything goes well', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(mockCodeVerificationEntity as any);
            userRepositoryMock.findOne.mockResolvedValueOnce(mockUserEntity as any);

            const user = await service.getUserByCode(testCode);

            expect(user).toEqual(mockUserEntity);
            expect(codeVerificationRepositoryMock.delete).toHaveBeenCalledWith(mockCodeVerificationEntity.id);
        });
    });

    describe('createCodeVerification', () => {
        const testCode = '123456';
        const mockUserEntity = {
            email: 'test@user.com',
        };

        const mockCodeVerificationEntity = {
            id: 1,
            code: testCode,
            user: mockUserEntity,
            is_sms: false,
            is_email: true,
        };

        beforeEach(() => {
            jest.spyOn(global.Math, 'random').mockReturnValue(0.234567);
        });

        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore();
        });

        it('should successfully create a new code verification', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(undefined);
            codeVerificationRepositoryMock.save.mockResolvedValueOnce(mockCodeVerificationEntity as any);

            const code = await service.createCodeVerification(mockUserEntity as any);

            expect(code.length).toEqual(6);
            expect(codeVerificationRepositoryMock.save).toHaveBeenCalledWith({
                code,
                user: mockUserEntity,
                is_sms: false,
                is_email: false,
            });
        });

        it('should delete existing code verification and create a new one', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(mockCodeVerificationEntity as any);
            codeVerificationRepositoryMock.delete.mockResolvedValueOnce({} as any);
            codeVerificationRepositoryMock.save.mockResolvedValueOnce(mockCodeVerificationEntity as any);

            const code = await service.createCodeVerification(mockUserEntity as any, true, true);

            expect(code.length).toEqual(6);
            expect(codeVerificationRepositoryMock.delete).toHaveBeenCalledWith((mockCodeVerificationEntity as any).id);
            expect(codeVerificationRepositoryMock.save).toHaveBeenCalledWith({
                code,
                user: mockUserEntity,
                is_sms: true,
                is_email: true,
            });
        });
    });describe('removeCodeVerification', () => {
        const testCode = '123456';

        const mockCodeVerificationEntity = {
            id: 1,
            code: testCode
        };

        it('should throw BadRequestException if no code is provided', async () => {
            const result = await service.removeCodeVerification('');

            expect(result).toBeFalsy();
        });

        it('should throw BadRequestException if code is not found in the repository', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(undefined);

            const result = await service.removeCodeVerification(testCode);

            expect(result).toBeFalsy();
        });

        it('should successfully remove the code verification and return true', async () => {
            codeVerificationRepositoryMock.findOne.mockResolvedValueOnce(mockCodeVerificationEntity as any);
            codeVerificationRepositoryMock.delete.mockResolvedValueOnce({} as any);

            const result = await service.removeCodeVerification(testCode);

            expect(result).toBe(true);
            expect(codeVerificationRepositoryMock.delete).toHaveBeenCalledWith(mockCodeVerificationEntity.id);
        });

        it('should handle unexpected errors and return false', async () => {
            codeVerificationRepositoryMock.findOne.mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });

            const result = await service.removeCodeVerification(testCode);

            expect(result).toBe(false);
        });
    });

});
