import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemService } from './services';
import { ItemResolver } from './resolvers';
import { BlobEntity } from "../../entities/blob.entity";
import { ItemEntity } from "../../entities/item.entity";
import { ActivityEntity } from "../../entities/activity.entity";
import { CollectionEntity } from "../../entities/collection.entity";
import { VItemTypeEntity } from "../../entities/_item-type.entity";
import { VItemSizeEntity } from "../../entities/_item-size.entity";
import { VItemCategoryEntity } from "../../entities/_item-category.entity";
import { VItemCountryStandardEntity } from "../../entities/_item-country-standard.entity";
import { AssetsStorageModule } from "../../core/assets-storage/assets-storage.module";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BlobEntity,
            ItemEntity,
            ActivityEntity,
            CollectionEntity,

            VItemTypeEntity,
            VItemSizeEntity,
            VItemCategoryEntity,
            VItemCountryStandardEntity
        ]),

        AssetsStorageModule,
        AuthenticationModule,
    ],
    providers: [
        ItemService,
        ItemResolver,
    ],
})

export class ItemModule {}
