import * as Upload from 'graphql-upload/Upload.js';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ProfileService } from '../services';
import { ProfileTeam, UpdateCustomerProfileInput, UpdateEmployeeProfileInput } from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { UserEntity } from "../../../entities/user.entity";

@Resolver()
export class ProfileResolver {
    constructor(
        private readonly service: ProfileService,
    ) {}

    @Query(() => [ ProfileTeam ])
    @UseGuards(AuthenticationGuard)
    public async getTeams(@Context() context): Promise<ProfileTeam[]> {
        const user: UserEntity = context.req.user;

        return this.service.getTeams(user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateCustomerProfile(@Context() context, @Args('data') data: UpdateCustomerProfileInput): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updateCustomerProfile(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateEmployeeProfile(@Context() context, @Args('data') data: UpdateEmployeeProfileInput): Promise<boolean> {
        return this.service.updateEmployeeProfile(data);
    }


    @Mutation(() => String)
    @UseGuards(AuthenticationGuard)
    public async uploadAvatar(@Context() context, @Args('image', { type: () => GraphQLUpload }) image: Upload): Promise<string> {
        const file: Upload = await image;
        const user: UserEntity = context.req.user;

        return this.service.uploadAvatar(file, user);
    }
}
