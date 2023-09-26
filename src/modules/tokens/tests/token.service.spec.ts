import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticationService, TokenEntity, UserEntity } from '@onversed/back';

import { TokenService } from '../services';
describe('Token Service', () => {
    let tokenService: TokenService;
    let mockTokenRepository: jest.Mocked<Repository<TokenEntity>>;
    let mockAuthenticationService: jest.Mocked<AuthenticationService>;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        mockTokenRepository = {
            findOne: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
        } as any;

        mockAuthenticationService = {
            generateToken: jest.fn(),
            hashToken: jest.fn(),
        } as any;

        mockConfigService = {
            get: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                {
                    provide: getRepositoryToken(TokenEntity),
                    useValue: mockTokenRepository,
                },
                {
                    provide: AuthenticationService,
                    useValue: mockAuthenticationService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        tokenService = module.get<TokenService>(TokenService);
    });

    describe('Create Token', () => {
        it('should create a new token, delete the old one if exists and return token details', async () => {
            const mockUser: UserEntity = { id: '1', is_confirmed: true, mobile_phone: '1234567890' } as UserEntity;

            mockAuthenticationService.generateToken.mockResolvedValue('mockAccessToken');
            mockAuthenticationService.hashToken.mockResolvedValue('mockHashedToken');
            mockConfigService.get.mockReturnValue('mockExpirationTime');

            const result = await tokenService.createToken(mockUser);

            expect(mockAuthenticationService.generateToken).toHaveBeenCalledWith(mockUser);
            expect(mockAuthenticationService.hashToken).toHaveBeenCalledWith('mockAccessToken');
            expect(mockTokenRepository.findOne).toHaveBeenCalledWith({ where: { user: mockUser } });
            expect(mockTokenRepository.save).toHaveBeenCalledWith({
                user: mockUser,
                token: 'mockAccessToken',
                token_type: 'Bearer',
                expire_in: 'mockExpirationTime',
            });

            expect(result).toEqual({
                accessToken: 'mockAccessToken',
                refreshToken: 'mockHashedToken',
                is_confirmed: mockUser.is_confirmed,
                mobile_phone: mockUser.mobile_phone,
                has_mobile_phone: true,
            });
        });
    });
});
