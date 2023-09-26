import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../services';

jest.mock('@sendgrid/mail', () => ({
    send: jest.fn(),
    setApiKey: jest.fn(),
}));

describe('MailService', () => {
    let mailService: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('some_api_key')
                    }
                }
            ]
        }).compile();

        mailService = module.get<MailService>(MailService);
    });

    it('should send an email successfully', async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sendgrid = require('@sendgrid/mail');

        const mailData = {
            to: 'test@example.com',
            from: 'from@example.com',
            subject: 'Test Subject',
            text: 'Test Content'
        };

        const result = await mailService.send(mailData);

        expect(result).toBe(true);
        expect(sendgrid.send).toHaveBeenCalledWith(mailData);
    });

    it('should handle an error while sending email', async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sendgrid = require('@sendgrid/mail');

        sendgrid.send.mockImplementationOnce(() => {
            throw new Error('Test Error');
        });

        const mailData = {
            to: 'test@example.com',
            from: 'from@example.com',
            subject: 'Test Subject',
            text: 'Test Content'
        };

        const result = await mailService.send(mailData);

        expect(result).toBe(false);
    });

    it('should set SendGrid API key from config', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sendgrid = require('@sendgrid/mail');

        expect(sendgrid.setApiKey).toHaveBeenCalledWith('some_api_key');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
