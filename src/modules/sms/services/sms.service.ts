import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly twilioService: TwilioService,
    ) {}

    public async send(sms: { mobile_phone: string, body: string }): Promise<boolean> {
        try {
            await this.twilioService.client.messages.create({
                body: sms.body,
                to: sms.mobile_phone,
                from: this.configService.get<string>('TWILIO_ACCOUNT_PHONE_NUMBER'),
            });

            return true;
        } catch (error) {
            return false;
        }
    }
}
