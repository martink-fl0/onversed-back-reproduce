import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ItemService } from '../services';
import { Item, ItemCreationInput, ItemSearchInput, ItemUpdateInput } from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { ItemEntity } from "../../../entities/item.entity";
import { UserEntity } from "../../../entities/user.entity";

@Resolver()
export class ItemResolver {
    constructor(
        private readonly service: ItemService,
    ) {}

    @Query(() => Item)
    @UseGuards(AuthenticationGuard)
    public async getItem(
        @Context() context, @Args('id') id: string
    ): Promise<ItemEntity> {
        const user: UserEntity = context.req.user;

        return this.service.getItem(id, user);
    }

    @Query(() => [Item])
    @UseGuards(AuthenticationGuard)
    public async getItems(
        @Context() context, @Args('data') data: ItemSearchInput
    ): Promise<ItemEntity[]> {
        const user: UserEntity = context.req.user;

        return this.service.getItems(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async createItem(
        @Context() context, @Args('data') data: ItemCreationInput
    ): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.createItem(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateItem(
        @Context() context, @Args('id') id: string, @Args('data') data: ItemUpdateInput
    ): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updateItem(id, data, user);
    }
}
