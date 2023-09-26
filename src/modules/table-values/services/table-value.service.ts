import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { TableValueInput } from '../gql';
import { TABLE_VALUES_USES_CACHE_NAME } from '../constants';
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Injectable()
export class TableValueService implements OnModuleInit {
    constructor(
        @InjectRepository(VItemUseEntity)
        private readonly useRepository: Repository<VItemUseEntity>,

        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    public async onModuleInit(): Promise<void> {
        let use: VItemUseEntity = await this.cacheManager.get<VItemUseEntity>(TABLE_VALUES_USES_CACHE_NAME);

        if (!use) {
            use = await this.loadTableValuesFromDatabase('factory');

            await this.cacheManager.set(TABLE_VALUES_USES_CACHE_NAME, use, 60*60*24*30);
        }
    }

    public async getTableValue(data: TableValueInput): Promise<VItemUseEntity> {
        const use_factory_value = this.cacheManager.get<VItemUseEntity>(TABLE_VALUES_USES_CACHE_NAME)

        if (data.is_factory && use_factory_value) {
            return use_factory_value;
        }

        const use = await this.loadTableValuesFromDatabase(this.getTableValueNameFilter(data));

        if (data.is_factory && !use_factory_value) {
            await this.cacheManager.set(TABLE_VALUES_USES_CACHE_NAME, use, 60*60*24*30);
        }

        return use;
    }

    private async loadTableValuesFromDatabase(name: string): Promise<VItemUseEntity> {
        return this.useRepository.findOne({
            where: {
                name,
            },
            relations: [
                'types',
                'files',
                'countries',
                'categories',
                'categories.sizes',
            ],
        });
    }

    private getTableValueNameFilter(data: TableValueInput): string {
        if (data.is_factory) {
            return 'factory';
        } else if (data.is_assets || data.is_roblox || data.is_zepeto || data.is_spatial || data.is_decentraland) {
            return 'asset';
        } else {
            return 'other';
        }
    }
}
