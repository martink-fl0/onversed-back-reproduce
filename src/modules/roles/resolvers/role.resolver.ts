import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { RoleService } from '../services';
import { CreateRoleInput, Role } from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";

@Resolver()
export class RoleResolver {
    constructor(
        private readonly service: RoleService,
    ) {}

    @Query(() => [Role])
    @UseGuards(AuthenticationGuard)
    public async getRoles(): Promise<Role[]> {
        return this.service.getRoles();
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async createRole(@Context() context, @Args('data') data: CreateRoleInput): Promise<boolean> {
        return this.service.createRole(data);
    }
}
