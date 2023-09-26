import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { TableValueService } from './services';
import { TableValueResolver } from './resolvers';

import {
    ItemUseSeeder,
    ItemFileSeeder,
    ItemSizeSeeder,
    ItemTypeSeeder,
    ItemCategorySeeder,
    ItemCountryStandardSeeder,
} from './seeders';
import { VItemUseEntity } from "../../entities/_item-use.entity";
import { VItemFileEntity } from "../../entities/_item-file.entity";
import { VItemSizeEntity } from "../../entities/_item-size.entity";
import { VItemTypeEntity } from "../../entities/_item-type.entity";
import { VItemCategoryEntity } from "../../entities/_item-category.entity";
import { VItemCountryStandardEntity } from "../../entities/_item-country-standard.entity";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VItemUseEntity,
            VItemFileEntity,
            VItemSizeEntity,
            VItemTypeEntity,
            VItemCategoryEntity,
            VItemCountryStandardEntity,
        ]),

        CacheModule.register(),

        AuthenticationModule,
    ],
    providers: [
        TableValueService,
        TableValueResolver,

        ItemUseSeeder,
        ItemFileSeeder,
        ItemSizeSeeder,
        ItemTypeSeeder,
        ItemCategorySeeder,
        ItemCountryStandardSeeder,
    ]
})

export class TableValueModule {}
