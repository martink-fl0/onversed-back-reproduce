import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { ActivityService } from '../services';
import { Activity, ActivityInput } from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { ActivityEntity } from "../../../entities/activity.entity";

@Resolver()
export class ActivityResolver {
    constructor(
        private readonly service: ActivityService,
    ) {}

    @Query(() => [Activity])
    @UseGuards(AuthenticationGuard)
    public async getActivitiesCollections(@Args('data') data: ActivityInput): Promise<ActivityEntity[]> {
        return this.service.getActivitiesCollections(data);
    }

    @Query(() => [Activity])
    @UseGuards(AuthenticationGuard)
    public async getActivitiesItems(@Args('data') data: ActivityInput): Promise<ActivityEntity[]> {
        return this.service.getActivitiesItems(data)
    }}
