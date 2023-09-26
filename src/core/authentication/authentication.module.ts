import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthenticationGuard } from './guards';
import { AuthenticationService } from './services';
import { TokenEntity } from '../../entities/token.entity';

@Module({
    imports: [
        JwtModule.register({
            secret: 'secret',
            signOptions: {
                expiresIn: '1h',
            },
        }),

        TypeOrmModule.forFeature([
            TokenEntity,
        ]),
    ],
    providers: [
        AuthenticationGuard,
        AuthenticationService,

        JwtService,
    ],
    exports: [
        AuthenticationGuard,
        AuthenticationService,

        JwtService,
    ]
})

export class AuthenticationModule {}
