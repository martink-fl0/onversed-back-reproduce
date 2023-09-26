import * as SendGrid from '@sendgrid/mail';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
    ) {
        SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
    }

    public async send(mail: SendGrid.MailDataRequired): Promise<boolean> {

        try {
            await SendGrid.send(mail);
        } catch (error) {
            return false;
        }

        return true;
    }
}
