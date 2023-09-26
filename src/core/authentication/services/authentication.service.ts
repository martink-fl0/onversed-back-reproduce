import * as bcrypt from 'bcryptjs';

import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../../../entities/user.entity';
import { TokenEntity } from '../../../entities/token.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(TokenEntity)
        private readonly tokenRepository: Repository<TokenEntity>,

        private readonly jwtService: JwtService,
    ) {}

    public async generateToken(user: UserEntity): Promise<string> {
        const payload = {
            sub: user.id,
            email: user.email,
            profiles: user.profiles,
            mobile_phone: user.mobile_phone,
            roles: [''],
        };

        return this.jwtService.sign(payload, {
            secret: 'secret',
            privateKey: 'secret',
        });
    }

    public async hashToken(token: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(token, saltRounds);
    }

    public async validateToken(accessToken: string): Promise<any> {
        try {
            const isOk = this.jwtService.verify<object>(accessToken, {
                secret: 'secret',
            });

            if (!isOk) {
                return false;
            }

            const token: TokenEntity = await this.tokenRepository.findOne({
                where: {
                    token: accessToken
                },
                relations: [
                    'user',
                    'user.profiles',
                    'user.profiles.company',
                ],
            });

            return token.user;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
