import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Role } from '../gql';
import { RoleEntity } from "../../../entities/role.entity";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly repository: Repository<RoleEntity>,
    ) {}

    public async getRoles(): Promise<Role[]> {
        const roles: RoleEntity[] = await this.repository.find();

        return roles.map((role: RoleEntity) => ({
            id: role.id,
            name: role.name,
        }));
    }

    public async createRole(data: { name: string }): Promise<boolean> {
        const role: RoleEntity = this.repository.create(data);

        await this.repository.save(role);

        return true;
    }
}
