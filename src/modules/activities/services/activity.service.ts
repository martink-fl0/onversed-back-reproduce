import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ActivityInput } from '../gql';
import { ActivityEntity } from "../../../entities/activity.entity";
import { ItemEntity } from "../../../entities/item.entity";
import { CollectionEntity } from "../../../entities/collection.entity";
import { UserEntity } from "../../../entities/user.entity";

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(ActivityEntity)
        private readonly repository: Repository<ActivityEntity>,

        @InjectRepository(ItemEntity)
        private readonly itemRepository: Repository<ItemEntity>,

        @InjectRepository(CollectionEntity)
        private readonly collectionRepository: Repository<CollectionEntity>,
    ) {}

    public async getActivitiesCollections(data: ActivityInput): Promise<ActivityEntity[]> {
        try {
            const collection: CollectionEntity = await this.collectionRepository.findOne({
                where: {
                    id: data.collection,
                }
            });

            if (!collection) {
                throw new Error('Collection is required');
            }

            return await this.repository.find({
                where: {
                    collection,
                },
                take: data.limit || 10,
                skip: data.offset || 0,
                relations: []
            });
        } catch {
            throw new Error('Error in activities collections');
        }
    }

    public async getActivitiesItems(data: ActivityInput): Promise<ActivityEntity[]> {
        try {
            const item: ItemEntity = await this.itemRepository.findOne({
                where: {
                    id: data.item,
                }
            });

            if (!item) {
                throw new Error('Item is required');
            }

            return await this.repository.find({
                where: {
                    item,
                },
                take: data.limit || 10,
                skip: data.offset || 0,
                relations: []
            });
        } catch {
            throw new Error('Error in activities items');
        }
    }

    public async createActivity(data: ActivityInput, user: UserEntity): Promise<ActivityEntity> {
        try {
            const collection: CollectionEntity = await this.collectionRepository.findOne({
                where: {
                    id: data.collection,
                }
            });

            const item: ItemEntity = await this.itemRepository.findOne({
                where: {
                    id: data.item,
                }
            });

            if (!collection && !item) {
                throw new Error('Collection or item is required');
            }

            const activity: ActivityEntity = this.repository.create({
                item: item,
                type: data.type,
                collection: collection,
                profile: user.profiles[0],
            })

            return this.repository.save(activity);
        } catch {
            throw new Error('Error in create activity');
        }
    }
}
