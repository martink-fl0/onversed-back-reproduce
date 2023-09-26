import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollectionService } from './services';
import { CollectionResolver } from './resolvers';
import { BlobEntity } from "../../entities/blob.entity";
import { CompanyEntity } from "../../entities/company.entity";
import { ProfileEntity } from "../../entities/profile.entity";
import { ActivityEntity } from "../../entities/activity.entity";
import { CollectionEntity } from "../../entities/collection.entity";
import { AssetsStorageModule } from "../../core/assets-storage/assets-storage.module";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BlobEntity,
            CompanyEntity,
            ProfileEntity,
            ActivityEntity,
            CollectionEntity,
        ]),

        AssetsStorageModule,
        AuthenticationModule,
    ],
    providers: [
        CollectionService,
        CollectionResolver,
    ],
})

export class CollectionModule {}
