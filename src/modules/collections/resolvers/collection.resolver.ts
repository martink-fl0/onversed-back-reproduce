import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CollectionService } from '../services';
import {
    Collection,
    CollectionCreationInput,
    CollectionSearchDesignerInput,
    CollectionSearchInput,
    CollectionUpdateInput,
    Designer
} from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { CollectionEntity } from "../../../entities/collection.entity";
import { UserEntity } from "../../../entities/user.entity";
import { ProfileEntity } from "../../../entities/profile.entity";

@Resolver()
export class CollectionResolver {
    constructor(
        private readonly service: CollectionService,
    ) {}

    @Query(() => Collection)
    @UseGuards(AuthenticationGuard)
    public async getCollection(
        @Context() context, @Args('id') id: string
    ): Promise<CollectionEntity> {
        const user: UserEntity = context.req.user;

        return this.service.getCollection(id, user);
    }

    @Query(() => [Collection])
    @UseGuards(AuthenticationGuard)
    public async getCollections(
        @Context() context, @Args('data') data: CollectionSearchInput
    ): Promise<CollectionEntity[]> {
        const user: UserEntity = context.req.user;

        return this.service.getCollections(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async createCollection(
        @Context() context, @Args('data') data: CollectionCreationInput
    ): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.createCollection(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateCollection(
        @Context() context, @Args('id') id: string, @Args('data') data: CollectionUpdateInput
    ): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updateCollection(id, data, user);
    }

    @Query(() => [Designer])
    @UseGuards(AuthenticationGuard)
    public async getDesigners(
        @Context() context, @Args('data') data: CollectionSearchDesignerInput
    ): Promise<ProfileEntity[]> {
        const user: UserEntity = context.req.user;

        return this.service.getDesigners(user, data);
    }
}
