import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';
import { RoleSeeder } from './modules/roles/seeders';

import {
    ItemUseSeeder,
    ItemFileSeeder,
    ItemSizeSeeder,
    ItemTypeSeeder,
    ItemCategorySeeder,
    ItemCountryStandardSeeder,
} from "./modules/table-values/seeders";

async function bootstrap(): Promise<void> {
    const app: INestApplication = await NestFactory.create(AppModule);
    const rolesSeeder = app.get(RoleSeeder);

    const itemUseSeeder: ItemUseSeeder = app.get(ItemUseSeeder);
    const itemSizeSeeder: ItemSizeSeeder = app.get(ItemSizeSeeder);
    const itemFileSeeder: ItemFileSeeder = app.get(ItemFileSeeder);
    const itemTypeSeeder: ItemTypeSeeder = app.get(ItemTypeSeeder);
    const itemCategorySeeder: ItemCategorySeeder = app.get(ItemCategorySeeder);
    const itemCountryStandardSeeder: ItemCountryStandardSeeder = app.get(ItemCountryStandardSeeder);

    app.enableCors();

    app.use(
        '/graphql',
        graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10    })
    );

    await rolesSeeder.seed();

    await itemUseSeeder.seed();
    await itemSizeSeeder.seed();
    await itemTypeSeeder.seed();
    await itemFileSeeder.seed();
    await itemCountryStandardSeeder.seed();

    await itemCategorySeeder.seed();

    await app.listen(process.env.PORT || 5005);
}

bootstrap();
