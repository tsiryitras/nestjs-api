/* eslint-disable max-lines-per-function */
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceMock } from '../auth/auth.service.mock';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import configurationTest from '../config/configuration-test.constant';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { MailNotificationSenderMockService } from '../mail-notification-sender/mail-notification-sender-mock.service';
import { MailNotificationSenderService } from '../mail-notification-sender/mail-notification-sender.interface';
import { MailNotification, mailNotificationSchema } from '../mail-notification/entities/mail-notification.entity';
import { MailNotificationRepository } from '../mail-notification/mail-notification.repository';
import { MailNotificationService } from '../mail-notification/mail-notification.service';
import { Role, roleSchema } from '../role/entities/role.entity';
import { RoleRepository } from '../role/role.repository';
import { RoleService } from '../role/role.service';
import { TokenRequest, tokenRequestSchema } from '../token-request/entities/token-request.entity';
import { TokenRequestRepository } from '../token-request/token-request.repository';
import { TokenRequestService } from '../token-request/token-request.service';
import { User, userSchema } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('User controller', () => {
    let module: TestingModule;
    let userController: UserController;
    const userCollectionName = generateCollectionName();
    const roleCollectionName = generateCollectionName();
    const tokenRequestCollectionName = generateCollectionName();
    const mailNotificationCollectionName = generateCollectionName();

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    {
                        name: User.name,
                        schema: userSchema,
                        collection: userCollectionName,
                    },
                    {
                        name: Role.name,
                        schema: roleSchema,
                        collection: roleCollectionName,
                    },
                    {
                        name: TokenRequest.name,
                        schema: tokenRequestSchema,
                        collection: tokenRequestCollectionName,
                    },
                    {
                        name: MailNotification.name,
                        schema: mailNotificationSchema,
                        collection: mailNotificationCollectionName,
                    },
                ]),
                JwtModule.register({
                    secret: configurationTest().jwt.secretKey,
                    signOptions: { expiresIn: configurationTest().jwt.expiration },
                }),
            ],
            providers: [
                UserRepository,
                RoleRepository,
                TokenRequestRepository,
                MailNotificationRepository,
                RoleService,
                TokenRequestService,
                {
                    provide: CONFIGURATION_TOKEN_DI,
                    useValue: configurationTest(),
                },
                {
                    provide: MailNotificationSenderService,
                    useClass: MailNotificationSenderMockService,
                },
                MailNotificationService,
                {
                    provide: 'authService',
                    useClass: AuthServiceMock,
                },
                UserService,
            ],
            controllers: [UserController],
        }).compile();
        userController = module.get<UserController>(UserController);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Controller should be defined', () => {
        expect(userController).toBeDefined();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, []);
    });
});
