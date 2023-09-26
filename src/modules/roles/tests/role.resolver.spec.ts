import { Test, TestingModule } from '@nestjs/testing';

import { RoleService } from '../services';
import { RoleResolver } from '../resolvers';
import { AuthenticationGuard } from "../../../core/authentication/guards";

describe('RoleResolver', () => {
    let resolver: RoleResolver;
    let mockRoleService: jest.Mocked<RoleService>;

    beforeEach(async () => {
        mockRoleService = {
            getRoles: jest.fn(),
            createRole: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleResolver,
                {
                    provide: RoleService,
                    useValue: mockRoleService,
                },
            ],
        })
            .overrideGuard(AuthenticationGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        resolver = module.get<RoleResolver>(RoleResolver);
    });

    describe('getRoles', () => {
        it('should return an array of roles', async () => {
            mockRoleService.getRoles.mockResolvedValueOnce([
                { id: '1', name: 'Admin' },
                { id: '2', name: 'User' },
            ]);

            const roles = await resolver.getRoles();

            expect(roles).toEqual([
                { id: '1', name: 'Admin' },
                { id: '2', name: 'User' },
            ]);
        });
    });

    describe('createRole', () => {
        it('should create a role and return true', async () => {
            const testData = { name: 'Editor' };

            mockRoleService.createRole.mockResolvedValueOnce(true);

            const result = await resolver.createRole({}, testData);

            expect(result).toBeTruthy();
            expect(mockRoleService.createRole).toHaveBeenCalledWith(testData);
        });
    });
});
