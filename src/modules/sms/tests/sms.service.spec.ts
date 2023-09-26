import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import { Test, TestingModule } from '@nestjs/testing';

import { SmsService } from '../services';

describe('SMS Service', () => {
    let smsService: SmsService;
    let mockTwilioService: jest.Mocked<TwilioService>;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const mockTwilioProvider = {
            client: {
                messages: {
                    create: jest.fn(),
                },
            },
        };

        const mockConfigProvider = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SmsService,
                {
                    provide: TwilioService,
                    useValue: mockTwilioProvider,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigProvider,
                },
            ],
        }).compile();

        smsService = module.get<SmsService>(SmsService);
        mockTwilioService = module.get<TwilioService>(TwilioService) as jest.Mocked<TwilioService>;
        mockConfigService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    });


    xit('Should send a message and return true', async () => {
        mockConfigService.get.mockReturnValue('mockNumber');

        const result: boolean = await smsService.send({ mobile_phone: '1234567890', body: 'Test Message' });

        expect(result).toBeTruthy();
        expect(mockTwilioService.client.messages.create).toHaveBeenCalledWith({
            body: 'Test Message',
            to: '1234567890',
            from: 'mockNumber',
        });
    });

    it('Should handle error and return false', async () => {
        mockConfigService.get.mockReturnValue('mockNumber');
        mockTwilioService.client.messages.create.mockRejectedValue(new Error('Twilio Error'));

        const result: boolean = await smsService.send({ mobile_phone: '1234567890', body: 'Test Message' });

        expect(result).toBeFalsy();
    });
});
