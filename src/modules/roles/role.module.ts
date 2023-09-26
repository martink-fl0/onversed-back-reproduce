import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleSeeder } from './seeders';
import { RoleService } from './services';
import { RoleResolver } from './resolvers';
import { RoleEntity } from "../../entities/role.entity";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RoleEntity,
        ]),

        AuthenticationModule,
    ],
    providers: [
        RoleSeeder,
        RoleService,
        RoleResolver,
    ],
})

export class RoleModule {}
