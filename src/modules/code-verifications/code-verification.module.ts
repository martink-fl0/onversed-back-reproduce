import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';
import { CodeVerificationService } from './services';
import { UserEntity } from "../../entities/user.entity";
import { CodeVerificationEntity } from "../../entities/code-verification.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            CodeVerificationEntity,
        ]),

        SmsModule,
        MailModule,
    ],
    providers: [
        CodeVerificationEntity,
        CodeVerificationService,
    ],
    exports: [
        CodeVerificationService,
    ],
})

export class CodeVerificationModule {}
