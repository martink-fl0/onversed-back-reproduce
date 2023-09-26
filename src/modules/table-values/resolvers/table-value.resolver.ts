import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { TableValueService } from '../services';
import { TableValue, TableValueInput } from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Resolver()
export class TableValueResolver {
    constructor(
        private readonly service: TableValueService,
    ) {}

    @Query(() => TableValue)
    @UseGuards(AuthenticationGuard)
    public async getTableValue(@Args('data') data: TableValueInput ): Promise<VItemUseEntity> {
        return this.service.getTableValue(data);
    }
}
