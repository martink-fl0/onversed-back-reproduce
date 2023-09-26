import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CodeVerificationEntity } from "../../../entities/code-verification.entity";
import { UserEntity } from "../../../entities/user.entity";

@Injectable()
export class CodeVerificationService {
    constructor(
        @InjectRepository(CodeVerificationEntity)
        private readonly repository: Repository<CodeVerificationEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    public async getUserByCode(
        code: string, is_sms = false, is_email = false
    ): Promise<UserEntity> {
        if (!code) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const codeVerification: CodeVerificationEntity = await this.repository.findOne({
            where: {
                code,
                is_sms,
                is_email,
            }, relations: [
                'user',
            ],
        });

        if (!codeVerification) {
            throw new BadRequestException('@ErrorNotValid');
        }

        const user: UserEntity = await this.userRepository.findOne({
            where: {
                email: codeVerification.user.email,
            },
            relations: [
                'profiles',
            ]
        });

        if (!user) {
            throw new BadRequestException('@ErrorNotValid');
        }

        await this.repository.delete(codeVerification.id);

        return user;
    }

    public async createCodeVerification(user: UserEntity, is_sms = false, is_email = false): Promise<string> {
        const code: string = Math.floor(100000 + Math.random() * 900000).toString();

        const codeVerification: CodeVerificationEntity = await this.repository.findOne({
            where: {
                code,
                is_sms,
                is_email,
            }
        });

        if (codeVerification) {
            await this.repository.delete(codeVerification.id);
        }

        await this.repository.save({
            code,
            user,
            is_sms,
            is_email,
        });

        return code;
    }

    public async removeCodeVerification(code: string): Promise<boolean> {
        try {
            if (!code) {
                throw new BadRequestException('@ErrorNotValid');
            }

            const codeVerification: CodeVerificationEntity = await this.repository.findOne({
                where: {
                    code,
                }
            });

            if (!codeVerification) {
                throw new BadRequestException('@ErrorNotValid');
            }

            await this.repository.delete(codeVerification.id);

            return true;
        } catch (error) {
            return false;
        }
    }
}
