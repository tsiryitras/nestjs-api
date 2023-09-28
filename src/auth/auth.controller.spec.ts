/* eslint-disable max-lines-per-function */
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import configurationTest from '../config/configuration-test.constant';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { MailNotificationSenderMockService } from '../mail-notification-sender/mail-notification-sender-mock.service';
import { MailNotificationSenderService } from '../mail-notification-sender/mail-notification-sender.interface';
import { MailNotification, mailNotificationSchema } from '../mail-notification/entities/mail-notification.entity';
import { MailNotificationRepository } from '../mail-notification/mail-notification.repository';
import { MailNotificationService } from '../mail-notification/mail-notification.service';
import { PermissionCategory, PermissionName } from '../permission/entities/permission.entity';
import { CreateRoleDto } from '../role/dto/create-role.dto';
import { Role, RoleType, roleSchema } from '../role/entities/role.entity';
import { RoleRepository } from '../role/role.repository';
import { RoleService } from '../role/role.service';
import { TokenRequest, tokenRequestSchema } from '../token-request/entities/token-request.entity';
import { TokenRequestRepository } from '../token-request/token-request.repository';
import { TokenRequestService } from '../token-request/token-request.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User, userSchema } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceMock } from './auth.service.mock';

describe('AuthController', () => {
    let module: TestingModule;
    let userRepository: UserRepository;
    let mailNotificationRepository: MailNotificationRepository;
    let roleRepository: RoleRepository;
    let tokenRequestRepository: TokenRequestRepository;
    let authController: AuthController;
    const userCollectionName = generateCollectionName();
    const roleCollectionName = generateCollectionName();
    const mailNotificationCollectionName = generateCollectionName();
    const tokenRequestCollectionName = generateCollectionName();

    const defaultRole: CreateRoleDto = {
        description: 'default Role',
        name: 'role name',
        permissions: [
            {
                _id: `${new mongoose.Types.ObjectId()}`,
                category: PermissionCategory.DASHBOARD,
                name: PermissionName.VIEW_DASHBOARD,
            },
            {
                _id: `${new mongoose.Types.ObjectId()}`,
                category: PermissionCategory.ROLE,
                name: PermissionName.VIEW_ROLE,
            },
        ],
        type: RoleType.NEW_USER_DEFAULT_ROLE,
        nbPermissions: 2,
        nbUsers: 0,
    };
    const toBeCreatedUser: CreateUserDto = {
        creationDate: new Date(),
        email: 'user@email.email',
        entity: 'user entity',
        firstName: 'user',
        lastName: 'user',
        fullName: 'user user',
        fromSso: false,
        lastConnectionDate: new Date(),
        phone: '0000000',
        role: undefined,
        userName: 'user',
        filters: [],
        isActive: true,
    };

    let createdRole: Role;

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
                AuthService,
            ],
            controllers: [AuthController],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        roleRepository = module.get<RoleRepository>(RoleRepository);
        tokenRequestRepository = module.get<TokenRequestRepository>(TokenRequestRepository);
        mailNotificationRepository = module.get<MailNotificationRepository>(MailNotificationRepository);
        createdRole = await roleRepository.create(defaultRole);
        authController = module.get<AuthController>(AuthController);
        toBeCreatedUser.role = createdRole;
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Controller should be defined', () => {
        expect(authController).toBeDefined();
    });

    afterEach(async () => {
        await userRepository.model.deleteMany({}).exec();
        await tokenRequestRepository.model.deleteMany({}).exec();
        await mailNotificationRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await roleRepository.model.deleteMany({}).exec();
        await closeInMongodConnection(module, [
            userCollectionName,
            roleCollectionName,
            tokenRequestCollectionName,
            mailNotificationCollectionName,
        ]);
    });
});
