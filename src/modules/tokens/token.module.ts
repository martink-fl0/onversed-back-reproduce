import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenService } from './services';
import { TokenEntity } from "../../entities/token.entity";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        ConfigModule,

        TypeOrmModule.forFeature([
            TokenEntity,
        ]),

        AuthenticationModule,
    ],
    providers: [
        TokenEntity,
        TokenService,
    ],
    exports: [
        TokenService,
    ],
})

export class TokenModule {}
