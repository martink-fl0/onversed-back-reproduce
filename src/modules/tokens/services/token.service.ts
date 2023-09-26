import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { UserTokens } from '../../users/gql';
import { TokenEntity } from "../../../entities/token.entity";
import { AuthenticationService } from "../../../core/authentication/services";
import { UserEntity } from "../../../entities/user.entity";

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(TokenEntity)
        private readonly repository: Repository<TokenEntity>,

        private readonly configService: ConfigService,
        private readonly authenticationService: AuthenticationService,
    ) {}

    public async createToken(user: UserEntity): Promise<UserTokens> {
        const accessToken: string = await this.authenticationService.generateToken(user);
        const hashedToken: string = await this.authenticationService.hashToken(accessToken);

        const token: TokenEntity = await this.repository.findOne({ where: { user } });

        if (token) {
            await this.repository.delete(token.id);
        }

        await this.repository.save({
            user,
            token: accessToken,
            token_type: 'Bearer',
            expire_in: this.configService.get('JWT_EXPIRATION_TIME'),
        });

        return {
            accessToken: accessToken,
            refreshToken: hashedToken,
            is_confirmed: user.is_confirmed,
            mobile_phone: user.mobile_phone,
            has_mobile_phone: !!user.mobile_phone,
        };
    }
}
