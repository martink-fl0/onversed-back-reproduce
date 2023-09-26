import * as Upload from 'graphql-upload/Upload';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Between, In, Like, Not, QueryRunner, Raw, Repository } from 'typeorm';

import {
    CollectionCreationInput,
    CollectionSearchDesignerInput,
    CollectionSearchInput,
    CollectionUpdateInput
} from '../gql';
import { CollectionEntity } from "../../../entities/collection.entity";
import { BlobEntity, EBlobType } from "../../../entities/blob.entity";
import { ProfileEntity } from "../../../entities/profile.entity";
import { ActivityEntity, EActivityState } from "../../../entities/activity.entity";
import { AssetsStorageService } from "../../../core/assets-storage/services";
import { UserEntity } from "../../../entities/user.entity";

@Injectable()
export class CollectionService {
    constructor(
        @InjectRepository(CollectionEntity)
        private readonly repository: Repository<CollectionEntity>,

        @InjectRepository(BlobEntity)
        private readonly blobRepository: Repository<BlobEntity>,

        @InjectRepository(ProfileEntity)
        private readonly profileRepository: Repository<ProfileEntity>,

        @InjectRepository(ActivityEntity)
        private readonly activityRepository: Repository<ActivityEntity>,

        private readonly configService: ConfigService,
        private readonly assetsStorageService: AssetsStorageService,
    ) {}

    public async getCollection(id: string, user: UserEntity): Promise<CollectionEntity> {
        const profile: ProfileEntity = user.profiles[0];

        try {
            const collection: CollectionEntity = await this.repository.findOne({
                where: {
                    id,
                    company: {
                        id: profile.company.id,
                    }
                },
                relations: [
                    'blobs',
                    'items',
                    'designers',
                    'activities',
                    'activities.item',
                    'activities.profile',
                    'activities.collection',
                    'activities.profile.company',
                ]
            });

            if (!collection) {
                throw new BadRequestException('@ErrorNotValid');
            }

            return collection;
        } catch {
            throw new BadRequestException('@ErrorNotValid');
        }
    }

    public async getCollections(data: CollectionSearchInput, user: UserEntity): Promise<CollectionEntity[]> {
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
                'items',
                'items.blobs',
            ],
        });
    }

    public async updateCollection(id: string, data: CollectionUpdateInput, user: UserEntity): Promise<boolean> {
        const profile: ProfileEntity = user.profiles[0];
        const container_name = `${profile.company.name.toLowerCase()}-collections`;

        let file: Upload;
        let blob: BlobEntity;

        if (data.image) {
            file = await data.image;
        }

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            let collection: CollectionEntity = await this.repository.findOne({
                where: {
                    id,
                },
                relations: [
                    'blobs',
                    'items',
                    'designers',
                    'activities',
                ],
            });

            if (!collection) {
                throw new BadRequestException('@ErrorNotValid');
            }

            const designers: ProfileEntity[] = await this.getProfiles(data.designers);

            if (file) {
                blob = await this.createBlob(file, container_name, queryRunner);
            }

            const activity: ActivityEntity = this.activityRepository.create({
                profile,
                collection,
                type: EActivityState.Draft,
            });

            await queryRunner.manager.save(activity);

            const blobs: BlobEntity[] = blob ? [blob] : collection.blobs;

            collection = this.repository.merge(collection, {
                name: data.name,
                nft_url: data.nft_url,
                is_assets: data.is_assets,
                is_roblox: data.is_roblox,
                is_zepeto: data.is_zepeto,
                is_factory: data.is_factory,
                is_spatial: data.is_spatial,
                description: data.description,
                is_inherited: data.is_inherited,
                is_decentraland: data.is_decentraland,
                other_description: data.other_description,
                activities: [
                    activity,
                ],
            });

            collection.blobs = blobs;
            collection.designers = designers;

            await queryRunner.manager.save(collection);
            await queryRunner.commitTransaction();

            return true;
        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (file) {
                await this.assetsStorageService.deleteFile(container_name, file.filename);
            }

            throw new BadRequestException('@ErrorNotValid');
        }
    }

    public async createCollection(data: CollectionCreationInput, user: UserEntity): Promise<boolean> {
        const file: Upload = await data.image;
        const profile: ProfileEntity = user.profiles[0];
        const container_name: string = `${profile.company.name
            .toLowerCase()}collections`
            .replace(/_/g, '')
            .replace(/-/g, '');

        const queryRunner: QueryRunner = this.repository.manager.connection.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const designers: ProfileEntity[] = await this.getProfiles(data.designers);

            const blob: BlobEntity = await this.createBlob(file, container_name, queryRunner);

            const collection: CollectionEntity = this.repository.create({
                designers,
                name: data.name,
                nft_url: data.nft_url,
                company: profile.company,
                is_agreed: data.is_agreed,
                is_assets: data.is_assets,
                is_roblox: data.is_roblox,
                is_zepeto: data.is_zepeto,
                state: EActivityState.Draft,
                is_factory: data.is_factory,
                is_spatial: data.is_spatial,
                description: data.description,
                is_inherited: data.is_inherited,
                is_decentraland: data.is_decentraland,
                other_description: data.other_description,
                items: [],
                blobs: [
                    blob
                ],
            });

            const activity: ActivityEntity = this.activityRepository.create({
                profile,
                collection,
                type: EActivityState.Draft,
            });

            await queryRunner.manager.save(activity);

            collection.activities = [activity];

            await queryRunner.manager.save(collection);
            await queryRunner.commitTransaction();

            return true;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            await this.assetsStorageService.deleteFile(container_name, file.filename);

            throw new BadRequestException('@ErrorNotValid');
        }
    }

    public async getDesigners(user: UserEntity, data: CollectionSearchDesignerInput): Promise<ProfileEntity[]> {
        const names: string[] = data.name.split(' ');
        const profile: ProfileEntity = user.profiles[0];

        return await this.profileRepository.find({
            where: {
                id: Not(profile.id),
                ...(names[0] && {
                    first_name: Raw((alias: string): string =>
                        `LOWER(${alias}) LIKE LOWER('%${names[0]}%')`
                    )
                }),
                ...(names[1] && {
                    last_name: Raw((alias: string): string =>
                        `LOWER(${alias}) LIKE LOWER('%${names[1]}%')`
                    )
                }),
                company: {
                    id: profile.company.id,
                },
            },
            relations: [
                'user',
                'company',
                'roles'
            ],
        });
    }

    private async getProfiles(ids: string[]): Promise<ProfileEntity[]> {
        return await this.profileRepository.find({
            where: {
                id: In(ids),
            },
        });
    }

    private async createBlob(file: Upload, container_name: string, queryRunner: QueryRunner): Promise<BlobEntity> {
        const upload_data = await this.uploadCover(file, container_name);

        const blob: BlobEntity = this.blobRepository.create({
            size: file.encoding,
            mime: file.mimetype,
            type: EBlobType.Cover,
            name: upload_data.cover_name,
            url: upload_data.cover_url,
            request_id: upload_data.cover_id,
        });

        await queryRunner.manager.save(blob);

        return blob;
    }

    private async uploadCover(file: Upload, container_name: string): Promise<{ cover_id?: string, cover_url?: string, cover_name?: string }> {
        const element: { cover_id?: string, cover_url?: string, cover_name?: string } = {};

        const blob_name: string = file.filename;

        const file_buffer = await this.assetsStorageService.streamToBuffer(file.createReadStream());

        try {
            element.cover_name = blob_name;
            element.cover_id = await this.assetsStorageService.uploadFile(container_name, blob_name, file_buffer, file.mimetype);
            element.cover_url = `${this.configService.get('BLOB_STORAGE_URL')}/${container_name}/${blob_name}`;

            return element;
        } catch (error) {
            throw new BadRequestException('@ErrorNotValid');
        }
    }
}
