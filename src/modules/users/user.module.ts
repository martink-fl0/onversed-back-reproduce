import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserResolver } from './resolvers';
import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../tokens/token.module';
import { CodeVerificationService } from '../code-verifications/services';
import { UserCustomerService, UserEmployeeService, UserService } from './services';
import { UserEntity } from "../../entities/user.entity";
import { RoleEntity } from "../../entities/role.entity";
import { TokenEntity } from "../../entities/token.entity";
import { CompanyEntity } from "../../entities/company.entity";
import { ProfileEntity } from "../../entities/profile.entity";
import { CodeVerificationEntity } from "../../entities/code-verification.entity";
import { AuthenticationModule } from "../../core/authentication/authentication.module";

@Module({
    imports: [
        ConfigModule,

        TypeOrmModule.forFeature([
            UserEntity,
            RoleEntity,
            TokenEntity,
            CompanyEntity,
            ProfileEntity,
            CodeVerificationEntity,
        ]),

        SmsModule,
        MailModule,
        TokenModule,
        AuthenticationModule,
    ],
    providers: [
        UserService,
        UserResolver,
        UserCustomerService,
        UserEmployeeService,
        CodeVerificationService,
    ],
})

export class UserModule {}
