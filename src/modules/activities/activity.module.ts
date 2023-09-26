import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityService } from './services';
import { ActivityResolver } from './resolvers';
import { ItemEntity } from "../../entities/item.entity";
import { ActivityEntity } from "../../entities/activity.entity";
import { CollectionEntity } from "../../entities/collection.entity";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ItemEntity,
            ActivityEntity,
            CollectionEntity,
        ]),

        AuthenticationModule,
    ],
    providers: [
        ActivityService,
        ActivityResolver,
    ],
})

export class ActivityModule {}
