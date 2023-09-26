import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from "../../../entities/role.entity";

@Injectable()
export class RoleSeeder {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly repository: Repository<RoleEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count = await this.repository.count();

        if (count) {
            return;
        }

        const superAdminRole: RoleEntity = this.repository.create({ name: 'Super Admin' });
        const adminRole: RoleEntity = this.repository.create({ name: 'Admin' });
        const userRole: RoleEntity = this.repository.create({ name: 'User' });
        const designerRole: RoleEntity = this.repository.create({ name: 'Designer' });

        await this.repository.save([superAdminRole, adminRole, userRole, designerRole]);
    }
}
