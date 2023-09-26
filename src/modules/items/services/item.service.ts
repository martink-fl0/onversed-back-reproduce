import * as Upload from 'graphql-upload/Upload';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Between, Like, QueryRunner, Repository } from 'typeorm';

import { ItemCreationInput, ItemSearchInput } from '../gql';
import { TItemRelationData } from '../types';
import { ItemEntity } from "../../../entities/item.entity";
import { BlobEntity } from "../../../entities/blob.entity";
import { ActivityEntity, EActivityState } from "../../../entities/activity.entity";
import { CollectionEntity } from "../../../entities/collection.entity";
import { AssetsStorageService } from "../../../core/assets-storage/services";
import { VItemTypeEntity } from "../../../entities/_item-type.entity";
import { VItemSizeEntity } from "../../../entities/_item-size.entity";
import { VItemCategoryEntity } from "../../../entities/_item-category.entity";
import { VItemCountryStandardEntity } from "../../../entities/_item-country-standard.entity";
import { UserEntity } from "../../../entities/user.entity";
import { ProfileEntity } from "../../../entities/profile.entity";

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(ItemEntity)
        private readonly repository: Repository<ItemEntity>,

        @InjectRepository(BlobEntity)
        private readonly blobRepository: Repository<BlobEntity>,

        @InjectRepository(ActivityEntity)
        private readonly activityRepository: Repository<ActivityEntity>,

        @InjectRepository(CollectionEntity)
        private readonly collectionRepository: Repository<CollectionEntity>,

        private readonly configService: ConfigService,
        private readonly assetsStorageService: AssetsStorageService,

        @InjectRepository(VItemTypeEntity)
        private readonly valueItemTypeRepository: Repository<VItemTypeEntity>,

        @InjectRepository(VItemSizeEntity)
        private readonly valueItemSizeRepository: Repository<VItemSizeEntity>,

        @InjectRepository(VItemCategoryEntity)
        private readonly valueItemCategoryRepository: Repository<VItemCategoryEntity>,

        @InjectRepository(VItemCountryStandardEntity)
        private readonly valueItemCountryStandardRepository: Repository<VItemCountryStandardEntity>,
    ) {}

    public async getItem(id: string, user: UserEntity): Promise<ItemEntity> {
        const profile: ProfileEntity = user.profiles[0];

        try {
            const item: ItemEntity = await this.repository.findOne({
                where: {
                    id,
                    company: {
                        id: profile.company.id,
                    }
                },
                relations: [
                    'blobs',
                    'activities',
                    'collection',
                    'category',
                    'type',
                    'country_standard',
                    'size',
                ]
            });

            if (!item) {
                throw new BadRequestException('@ErrorNotValid');
            }

            return item;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    public async getItems(data: ItemSearchInput, user: UserEntity): Promise<ItemEntity[]> {
        const profile: ProfileEntity = user.profiles[0];
        const { start_at, end_at, ...rest } = data;

        const whereClause: any = Object.entries(rest).reduce((acc, [key, value]) => {
            if (typeof value !== 'undefined') {
                if (key === 'name') {
                    acc[key] = Like(`%${value}%`);
                } else {
                    acc[key] = value;
                }
            }
            return acc;
        }, {});

        if (start_at && end_at) {
            whereClause['created_at'] = Between(start_at, end_at);
        }

        whereClause['company.id'] = profile.company.id;

        return await this.repository.find({
            where: whereClause,
            take: data.limit || 10,
            skip: data.offset || 0,
            relations: [
                'blobs',
                'collection',
            ],
        });
    }

    public async updateItem(id: string, data: any, user: UserEntity): Promise<boolean> {
        const profile: ProfileEntity = user.profiles[0];
        const container_name = `${profile.company.name.toLowerCase()}-collections`;

        const files: Upload[] = [];

        if (data.images && data.images.length) {
            for (const image of data.images) {
                files.push(await image);
            }
        }

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const relations: TItemRelationData = await this.checkDataValues(data, profile);

            let item: ItemEntity = await this.repository.findOne({
                where: {
                    id,
                    company: {
                        id: profile.company.id,
                    }
                },
                relations: [
                    'blobs',
                    'activities',
                    'collection',
                    'category',
                    'type',
                    'country_standard',
                    'size',
                ]
            });

            if (!item) {
                throw new BadRequestException('@ErrorNotValid');
            }

            const blobs: BlobEntity[] = [];

            for (const file of files) {
                const blob: BlobEntity = await this.createBlob(file, container_name, queryRunner);

                blobs.push(blob);
            }

            const activity: ActivityEntity = this.activityRepository.create({
                item,
                profile,
                type: EActivityState.Draft,
            });

            await queryRunner.manager.save(activity);

            item = this.repository.merge(item, {
                name: data.name,
                sku: data.sku,
                nft_url: data.nft_url,
                description: data.description,
                state: data.to_sent ? EActivityState.Sent : EActivityState.Draft,
                is_assets: data.is_assets,
                is_roblox: data.is_roblox,
                is_zepeto: data.is_zepeto,
                is_factory: data.is_factory,
                is_spatial: data.is_spatial,
                is_decentraland: data.is_decentraland,
                collection: relations.collection,
                category: relations.category,
                type: relations.type,
                size: relations.size,
                country_standard: relations.country_standard,
            });

            item.blobs= blobs;

            await queryRunner.manager.save(item);
            await queryRunner.commitTransaction();

            return true;
        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (files && files.length) {
                for (const file of files) {
                    await this.assetsStorageService.deleteFile(container_name, file.filename);
                }
            }

            throw new BadRequestException(error);
        }

        return true;
    }

    public async createItem(data: ItemCreationInput, user: UserEntity): Promise<boolean> {
        console.log('Data', data);
        const profile: ProfileEntity = user.profiles[0];
        const container_name = `${profile.company.name
            .toLowerCase()}items`
            .replace(/_/g, '')
            .replace(/-/g, '');

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const relations: TItemRelationData = await this.checkDataValues(data, profile);

            const blobs: BlobEntity[] = [];

            for (const element of data.blobs) {
                const files: Upload[] = element.images;

                console.log('Files', files);

                for (let file of files) {
                    file = await file;

                    console.log('File', file);

                    const blob: BlobEntity = await this.createBlob({
                        ...file,
                        type: element.type,
                    }, container_name, queryRunner);

                    blobs.push(blob);
                }
            }

            console.log('blobs', blobs);

            const item: ItemEntity = this.repository.create({
                name: data.name,
                sku: data.sku,
                nft_url: data.nft_url,
                description: data.description,
                state: data.to_sent ? EActivityState.Sent : EActivityState.Draft,
                is_assets: data.is_assets,
                is_roblox: data.is_roblox,
                is_zepeto: data.is_zepeto,
                is_factory: data.is_factory,
                is_spatial: data.is_spatial,
                is_decentraland: data.is_decentraland,
                blobs,
                collection: relations.collection,
                category: relations.category,
                type: relations.type,
                size: relations.size,
                country_standard: relations.country_standard,
                company: profile.company,
            });

            console.log('item', item);

            const activity: ActivityEntity = this.activityRepository.create({
                item,
                profile,
                type: EActivityState.Draft,
            });

            await queryRunner.manager.save(activity);

            item.activities = [activity];

            await queryRunner.manager.save(item);
            await queryRunner.commitTransaction();

            return true;
        } catch (error) {
            console.log('Error', error);
            await queryRunner.rollbackTransaction();

            for (const element of data.blobs) {
                const files: Upload[] = element.images;

                for (const file of files) {
                    await this.assetsStorageService.deleteFile(container_name, file.filename);
                }
            }

            throw new BadRequestException(error);
        }
    }

    private async checkDataValues(data: any, profile: ProfileEntity): Promise<TItemRelationData> {
        const collection: CollectionEntity = await this.collectionRepository.findOne({
            where: {
                id: data.collection,
                company: {
                    id: profile.company.id,
                }
            }
        });

        if (!collection) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const size: VItemSizeEntity = await this.valueItemSizeRepository.findOne({
            where: {
                id: data.size,
            }
        });

        if (!size) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const category: VItemCategoryEntity = await this.valueItemCategoryRepository.findOne({
            where: {
                id: data.category,
            }
        });

        if (!category) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const type: VItemTypeEntity = await this.valueItemTypeRepository.findOne({
            where: {
                id: data.type,
            }
        });

        if (!type) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const country_standard: VItemCountryStandardEntity = await this.valueItemCountryStandardRepository.findOne({
            where: {
                id: data.country_standard,
            }
        });

        if (!country_standard) {
            throw new BadRequestException('@ErrorNotValid');
        }

        return {
            type,
            size,
            category,
            collection,
            country_standard,
        };
    }

    private async createBlob(file: Upload, container_name: string, queryRunner: QueryRunner): Promise<BlobEntity> {
        const upload_data: any = await this.uploadImage(file, container_name);

        console.log('Upload data', upload_data);

        const blob: BlobEntity = this.blobRepository.create({
            type: file.type,
            size: file.encoding,
            mime: file.mimetype,
            url: upload_data.image_url,
            name: upload_data.image_name,
            request_id: upload_data.image_id,
        });

        console.log('Blob', blob);

        await queryRunner.manager.save(blob);

        return blob;
    }

    private async uploadImage(file: Upload, container_name: string): Promise<{ image_id?: string, image_url?: string, image_name?: string }> {
        const element: { image_id?: string, image_url?: string, image_name?: string } = {};

        const blob_name: string = file.filename;

        const file_buffer = await this.assetsStorageService.streamToBuffer(file.createReadStream());

        try {
            element.image_name = blob_name;
            element.image_url = `${this.configService.get('BLOB_STORAGE_URL')}/${container_name}/${blob_name}`;
            element.image_id = await this.assetsStorageService.uploadFile(container_name, blob_name, file_buffer, file.mimetype);

            return element;
        } catch (error) {
            throw new BadRequestException('@ErrorNotValid');
        }
    }
}
