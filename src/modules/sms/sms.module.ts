import { Module } from '@nestjs/common';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SmsService } from './services';

@Module({
    imports: [
        ConfigModule,

        TwilioModule.forRootAsync({
            imports: [
                ConfigModule
            ],
            inject: [
                ConfigService,
            ],
            useFactory: (cfg: ConfigService) => {
                return ({
                    accountSid: cfg.get('TWILIO_ACCOUNT_SID'),
                    authToken: cfg.get('TWILIO_ACCOUNT_TOKEN'),
                })
            },
        }),
    ],
    providers: [
        SmsService,
    ],
    exports: [
        SmsService,
    ],
})

export class SmsModule {}
