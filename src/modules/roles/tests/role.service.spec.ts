import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Role } from '../gql';
import { RoleService } from '../services';
import { RoleEntity } from "../../../entities/role.entity";

describe('Role Service', () => {
    let roleService: RoleService;
    let mockRoleRepository: jest.Mocked<Partial<Repository<RoleEntity>>>;

    beforeEach(async () => {
        mockRoleRepository = {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                {
                    provide: getRepositoryToken(RoleEntity),
                    useValue: mockRoleRepository,
                },
            ],
        }).compile();

        roleService = module.get<RoleService>(RoleService);
    });

    describe('Get Roles', () => {
        it('Should return an array of roles', async () => {
            mockRoleRepository.find.mockResolvedValueOnce([
                { id: '1', name: 'Admin', created_at: new Date(), updated_at: new Date(), deleted_at: null },
                { id: '2', name: 'User', created_at: new Date(), updated_at: new Date(), deleted_at: null },
            ]);

            const roles: Role[] = await roleService.getRoles();

            expect(roles).toEqual([
                { id: '1', name: 'Admin' },
                { id: '2', name: 'User' },
            ]);
        });
    });

    describe('Create Role', () => {
        it('Should create a role and return true', async () => {
            const testData = { name: 'Editor', created_at: new Date(), updated_at: new Date(), deleted_at: null };
            const createdRole: RoleEntity = { id: '3', ...testData };

            mockRoleRepository.create.mockReturnValueOnce(createdRole);
            mockRoleRepository.save.mockResolvedValueOnce(createdRole);

            const result = await roleService.createRole(testData);

            expect(result).toBeTruthy();
            expect(mockRoleRepository.create).toHaveBeenCalledWith(testData);
            expect(mockRoleRepository.save).toHaveBeenCalledWith(createdRole);
        });
    });
});
