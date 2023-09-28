/* eslint-disable max-lines-per-function */
import { Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from './core/test-utils/mongodb-test.mock';
import { MailNotificationSenderMockService } from './mail-notification-sender/mail-notification-sender-mock.service';
import { MailNotificationSenderService } from './mail-notification-sender/mail-notification-sender.interface';
import {
    MailNotification,
    MailNotificationStatus,
    mailNotificationSchema,
} from './mail-notification/entities/mail-notification.entity';
import { MailNotificationRepository } from './mail-notification/mail-notification.repository';
import { MailNotificationService } from './mail-notification/mail-notification.service';
import { UserService } from './user/user.service';

describe('AppService', () => {
    let module: TestingModule;
    let appService: AppService;
    let mailNotificationService: MailNotificationService;
    let mailNotificationRepository: MailNotificationRepository;
    const mailNotificationCollectionName = generateCollectionName();

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    { name: MailNotification.name, schema: mailNotificationSchema, collection: mailNotificationCollectionName },
                ]),
            ],
            providers: [
                AppService,
                MailNotificationService,
                MailNotificationRepository,
                {
                    provide: MailNotificationSenderService,
                    useClass: MailNotificationSenderMockService,
                },
                {
                    provide: UserService,
                    useValue: {
                        checkInactiveAccount: () => {
                            Logger.log('test check inactive account');
                        },
                    },
                },
            ],
        }).compile();
        appService = module.get<AppService>(AppService);
        mailNotificationService = module.get<MailNotificationService>(MailNotificationService);
        mailNotificationRepository = module.get<MailNotificationRepository>(MailNotificationRepository);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should send all pending mail', async () => {
        await mailNotificationService.create({
            content: 'Some mail content',
            subject: 'some mail subject',
            to: 'someone@mail.mail',
        });
        expect(await mailNotificationRepository.count({ status: MailNotificationStatus.PENDING })).toEqual(1);
        await appService.sendPendingMail();
        expect(await mailNotificationRepository.count({ status: MailNotificationStatus.PENDING })).toEqual(0);
        await appService.clearPendingIntervals();
    });

    afterAll(async () => {
        await mailNotificationRepository.model.deleteMany({}).exec();
        await closeInMongodConnection(module, [mailNotificationCollectionName]);
    });
});
