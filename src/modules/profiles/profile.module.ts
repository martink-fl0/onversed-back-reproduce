import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileService } from './services';
import { ProfileResolver } from './resolvers';
import { UserEntity } from "../../entities/user.entity";
import { RoleEntity } from "../../entities/role.entity";
import { ProfileEntity } from "../../entities/profile.entity";
import { AssetsStorageModule } from "../../core/assets-storage/assets-storage.module";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            RoleEntity,
            ProfileEntity,
        ]),

        AssetsStorageModule,
        AuthenticationModule,
    ],
    providers: [
        ProfileService,
        ProfileResolver,
    ],
    exports: [
        ProfileService,
    ],
})

export class ProfileModule {}
