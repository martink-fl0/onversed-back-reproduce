import * as Upload from 'graphql-upload/Upload';

import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { UpdateCustomerProfileInput, UpdateEmployeeProfileInput } from '../gql';
import { ProfileEntity } from "../../../entities/profile.entity";
import { UserEntity } from "../../../entities/user.entity";
import { RoleEntity } from "../../../entities/role.entity";
import { AssetsStorageService } from "../../../core/assets-storage/services";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(ProfileEntity)
        private readonly repository: Repository<ProfileEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,

        private readonly configService: ConfigService,
        private readonly assetsStorageService: AssetsStorageService,
    ) {}

    public async getTeams(user: UserEntity): Promise<any[]> {
        const profiles: ProfileEntity[] = await this.repository.find({
            where: {
                company: {
                    name: user.profiles[0]?.company?.name,
                },
                user: {
                    deleted_at: null,
                }
            },
            relations: [
                'user',
                'company',
                'roles',
            ],
        });

        return profiles.filter((profile: ProfileEntity) => !profile.is_customer && profile.user).map((profile: ProfileEntity) => ({
            id: profile.user.id,
            roles: profile.roles,
            company: profile.company,
            email: profile.user.email,
            last_name: profile.last_name,
            job_title: profile.job_title,
            first_name: profile.first_name,
            is_active: profile.user.is_active,
            mobile_phone: profile.user.mobile_phone,
        }));
    }

    public async updateCustomerProfile(data: UpdateCustomerProfileInput, current_user: UserEntity): Promise<boolean> {
        try {
            const profile: ProfileEntity = current_user.profiles[0];

            profile.first_name = data.first_name;
            profile.last_name = data.last_name;
            profile.job_title = data.job_title;

            await this.repository.save(profile);

            return true;
        } catch (error) {
            console.error(error);
            throw new BadRequestException('@ErrorNotValid');
        }
    }

    public async updateEmployeeProfile(data: UpdateEmployeeProfileInput): Promise<boolean> {
        try {
            const user: UserEntity = await this.userRepository.findOne({
                where: {
                    email: data.email,
                },
                relations: [
                    'profiles',
                ],
            });

            if (!user) {
                throw new BadRequestException('@ErrorNotValid');
            }

            const profile: ProfileEntity = user.profiles[0];

            const role = await this.roleRepository.findOne({
                where: {
                    id: data.role,
                }
            });

            profile.roles = [role];
            profile.first_name = data.first_name;
            profile.last_name = data.last_name;

            profile.job_title = data.job_title;

            await this.repository.save(profile);

            user.email = data.email;
            user.mobile_phone = data.mobile_phone;

            await this.userRepository.save(user);

            return true;
        } catch (error) {
            console.error(error);
            throw new BadRequestException('@ErrorNotValid');
        }
    }

    public async uploadAvatar(file: Upload, current_user: UserEntity): Promise<string> {
        const profile: ProfileEntity = current_user.profiles[0];

        const blobName: string = file.filename;
        const containerName = 'avatars';

        const fileBuffer = await this.assetsStorageService.streamToBuffer(file.createReadStream());

        try {
            profile.avatar_id = await this.assetsStorageService.uploadFile(containerName, blobName, fileBuffer, file.mimetype);
            profile.avatar_url = `${this.configService.get('BLOB_STORAGE_URL')}/${containerName}/${blobName}`;

            await this.repository.save(profile);

            return profile.avatar_url;
        } catch (error) {
            console.error('Error uploading to Azure:', error);
            throw new BadRequestException('@ErrorNotValid');
        }
    }
}
