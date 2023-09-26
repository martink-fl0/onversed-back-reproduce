import * as path from 'path';

import { APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';

import { ItemModule } from "./modules/items";
import { ActivityModule } from "./modules/activities";
import { CollectionModule } from "./modules/collections";
import { UserModule } from './modules/users/user.module';
import { RoleModule } from './modules/roles/role.module';
import { TableValueModule } from "./modules/table-values";
import { ProfileModule } from './modules/profiles/profile.module';
import { ProfileEntity } from "./entities/profile.entity";
import { DBModule } from "./core/db";
import { UserEntity } from "./entities/user.entity";
import { RoleEntity } from "./entities/role.entity";
import { BlobEntity } from "./entities/blob.entity";
import { ItemEntity } from "./entities/item.entity";
import { TokenEntity } from "./entities/token.entity";
import { CompanyEntity } from "./entities/company.entity";
import { ActivityEntity } from "./entities/activity.entity";
import { CollectionEntity } from "./entities/collection.entity";
import { CodeVerificationEntity } from "./entities/code-verification.entity";
import { VItemUseEntity } from "./entities/_item-use.entity";
import { VItemTypeEntity } from "./entities/_item-type.entity";
import { VItemFileEntity } from "./entities/_item-file.entity";
import { VItemSizeEntity } from "./entities/_item-size.entity";
import { VItemCategoryEntity } from "./entities/_item-category.entity";
import { VItemCountryStandardEntity } from "./entities/_item-country-standard.entity";
import { GraphQLModule } from "./core/graph-ql/graph-ql.module";
import { AuthenticationModule } from "./core/authentication/authentication.module";

@Module({
    imports: [
        ConfigModule.forRoot({ cache: true, isGlobal: true }),

        I18nModule.forRootAsync({
            imports: undefined,
            inject: [ConfigService],
            resolvers: [AcceptLanguageResolver],
            useFactory: (configService: ConfigService) => {
                return ({
                    fallbackLanguage: 'en',
                    loaderOptions: {
                        path: path.join(__dirname, '../src/i18n/'),
                        watch: configService.get('NODE_ENV') === 'development',
                    },
                    logging: configService.get('NODE_ENV') === 'development',
                })
            }
        }),

        DBModule.forRoot([
            UserEntity,
            RoleEntity,
            BlobEntity,
            ItemEntity,
            TokenEntity,
            ProfileEntity,
            CompanyEntity,
            ActivityEntity,
            CollectionEntity,
            CodeVerificationEntity,

            VItemUseEntity,
            VItemTypeEntity,
            VItemFileEntity,
            VItemFileEntity,
            VItemSizeEntity,
            VItemCategoryEntity,
            VItemCountryStandardEntity,
        ]),
        GraphQLModule,
        AuthenticationModule,

        ItemModule,
        ActivityModule,
        CollectionModule,
        TableValueModule,

        RoleModule,
        UserModule,
        ProfileModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
    ]
})

export class AppModule {}
