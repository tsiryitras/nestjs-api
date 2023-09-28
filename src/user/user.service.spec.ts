/* eslint-disable max-lines-per-function */
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import * as mongoose from 'mongoose';
import { AuthServiceMock } from '../auth/auth.service.mock';
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
import { Paginated } from '../shared/types/page.interface';
import {
    TokenRequest,
    TokenRequestStatus,
    TokenRequestType,
    tokenRequestSchema,
} from '../token-request/entities/token-request.entity';
import { TokenRequestRepository } from '../token-request/token-request.repository';
import { TokenRequestService } from '../token-request/token-request.service';
import { BatchUserInsertReportDto } from './dto/batch-insert-user-report.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Table, User, UserFilter, userSchema } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
    let module: TestingModule;
    let userService: UserService;
    let userRepository: UserRepository;
    let mailNotificationRepository: MailNotificationRepository;
    let roleRepository: RoleRepository;
    let tokenRequestRepository: TokenRequestRepository;
    const userCollectionName = generateCollectionName();
    const roleCollectionName = generateCollectionName();
    const tokenRequestCollectionName = generateCollectionName();
    const mailNotificationCollectionName = generateCollectionName();

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

    const toBeCreatedFilter: UserFilter = {
        name: 'userFilter',
        table: Table.DOCUMENT,
        filter: {
            name: 'test',
        },
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
            ],
        }).compile();
        userService = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
        roleRepository = module.get<RoleRepository>(RoleRepository);
        tokenRequestRepository = module.get<TokenRequestRepository>(TokenRequestRepository);
        mailNotificationRepository = module.get<MailNotificationRepository>(MailNotificationRepository);
        createdRole = await roleRepository.create(defaultRole);
        toBeCreatedUser.role = createdRole;
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should create user', async () => {
        await userService.create(toBeCreatedUser);
        const result = await userRepository.findOne({ fullName: toBeCreatedUser.fullName }).exec();
        expect(result.fullName).toEqual(toBeCreatedUser.fullName);
    });

    it('Should return paginated user', async () => {
        await userService.create(toBeCreatedUser);
        const paginatedUser: Paginated<User> = await userService.getPaginated({
            page: 1,
            pageSize: 1,
            search: '',
            sortBy: 'fullName',
            sortOrder: 1,
        });
        expect(paginatedUser.totalItems).toEqual(1);
        expect(paginatedUser.items[0].fullName).toEqual(toBeCreatedUser.fullName);
    });

    it('Should return users for CSV export', async () => {
        await userService.create(toBeCreatedUser);
        const csvUsers: Partial<User>[] = await userService.getCsvData({
            search: 'user',
            sortBy: 'fullName',
            sortOrder: 1,
            columns: ['firstName', 'lastName', 'fullName', 'phone'],
        });
        expect(csvUsers[0].fullName).toEqual(toBeCreatedUser.fullName);
        expect(csvUsers[0]).not.toEqual(expect.objectContaining({ email: toBeCreatedUser.email }));
    });

    it('Should find one user and role is populated', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const result = await userService.findOne(createdUser._id as string);
        expect(result.fullName).toEqual(toBeCreatedUser.fullName);
        expect((result.role as Role).name).toEqual(defaultRole.name);
    });

    it('Should find user by user name', async () => {
        await userService.create(toBeCreatedUser);
        const result = await userService.findByUserName(toBeCreatedUser.userName);
        expect(result.fullName).toEqual(toBeCreatedUser.fullName);
    });

    it('User update should be effective', async () => {
        const expectedUserName = 'updated UserName';
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        await userService.update(inDatabaseCreatedUser._id as string, { userName: expectedUserName });
        const result = await userService.findOne(inDatabaseCreatedUser._id as string);
        expect(result.userName).toEqual(expectedUserName);
    });

    it('Should find user by its id', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const result = await userService.findById(createdUser._id as string);
        expect(result.fullName).toEqual(toBeCreatedUser.fullName);
    });

    it('Should find user by its email', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const result = await userService.findUserByEmail(createdUser.email);
        expect(result.fullName).toEqual(toBeCreatedUser.fullName);
    });

    it('Remove user should be effective', async () => {
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        expect(await userRepository.count({})).toEqual(1);
        await userService.remove(inDatabaseCreatedUser._id as string);
        expect(await userRepository.count({})).toEqual(0);
    });

    it('Should return permission names by user id', async () => {
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        const results = await userService.getPermissionNamesByUserId(inDatabaseCreatedUser._id as string);
        for (let i = 0; i < results.length; i++) {
            expect(results[i]).toEqual((toBeCreatedUser.role as Role).permissions[i].name);
        }
    });

    it('Should be able to request password reset', async () => {
        await userService.create(toBeCreatedUser);
        await userService.requestPasswordReset(toBeCreatedUser.email);
        const foundMailNotification: MailNotification = await mailNotificationRepository
            .findOne({ to: toBeCreatedUser.email })
            .lean()
            .exec();
        expect(foundMailNotification.to).toEqual(toBeCreatedUser.email);
        const foundTokenRequest: TokenRequest = await tokenRequestRepository
            .findOne({})
            .lean({ userMail: toBeCreatedUser.email })
            .exec();
        expect(await tokenRequestRepository.count({})).toEqual(1);
        expect(foundTokenRequest.userMail).toEqual(toBeCreatedUser.email);
    });

    it('Should be able to request init password', async () => {
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        const populatedUser = await userService.findOne(inDatabaseCreatedUser._id as string);
        await userService.requestInitPassword(populatedUser);
        const foundMailNotification: MailNotification = await mailNotificationRepository
            .findOne({ to: toBeCreatedUser.email })
            .lean()
            .exec();
        expect(foundMailNotification.to).toEqual(toBeCreatedUser.email);
        const foundTokenRequest: TokenRequest = await tokenRequestRepository
            .findOne({})
            .lean({ userMail: toBeCreatedUser.email })
            .exec();
        expect(await tokenRequestRepository.count({})).toEqual(1);
        expect(foundTokenRequest.userMail).toEqual(toBeCreatedUser.email);
        expect(foundTokenRequest.type).toEqual(TokenRequestType.ACCOUNT_CREATION);
    });

    it('Should be able to reset password', async () => {
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        const populatedUser = await userService.findOne(inDatabaseCreatedUser._id as string);
        await userService.requestInitPassword(populatedUser);
        const { token }: TokenRequest = await tokenRequestRepository.findOne({}).lean({ userMail: toBeCreatedUser.email }).exec();
        await userService.resetPassword('amkfjdkfmlAERER123$', token);
        const foundTokenRequest: TokenRequest = await tokenRequestRepository
            .findOne({})
            .lean({ userMail: toBeCreatedUser.email })
            .exec();
        expect(foundTokenRequest.status).toEqual(TokenRequestStatus.USED);
    });

    it('Should update last connection date', async () => {
        const inDatabaseCreatedUser = await userService.create(toBeCreatedUser);
        const lastYear = DateTime.fromJSDate(new Date()).minus({ year: 1 }).toJSDate();
        await userService.update(inDatabaseCreatedUser._id as string, {
            lastConnectionDate: lastYear,
        });
        await userService.updateLastConnectionDate(inDatabaseCreatedUser._id as string);
        const result = await userService.findOne(inDatabaseCreatedUser._id as string);
        expect(DateTime.fromJSDate(result.lastConnectionDate) > DateTime.fromJSDate(lastYear)).toEqual(true);
    });

    it('Should return true if user with duplicated email or userName exists', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const result = await userService.checkDuplication(createdUser);
        expect(result).toBe(true);
    });

    it('Should return false if user with duplicated email or userName does not exist', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const result = await userService.checkDuplication({
            ...createdUser,
            email: 'inexisting@email',
            userName: 'inexistingUserName',
        });
        expect(result).toBe(false);
    });

    it('Should add and update filter filter', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const userId = createdUser._id as string;
        const filterId = createdUser.filters[0]._id;
        const results: UserFilter[] = await userService.addUserFilter({
            userId,
            filter: { _id: filterId, ...toBeCreatedFilter },
        });
        expect(results.length === 1);
        const updatedResults: UserFilter[] = await userService.updateUserFilter({
            userId,
            filter: {
                _id: filterId,
                ...toBeCreatedFilter,
                filter: {
                    name: 'test2',
                },
            },
        });
        expect(updatedResults[0].filter.name).toEqual('test2');
        const deleteResults = await userService.deleteUserFilter({
            userId,
            filter: { _id: filterId, ...toBeCreatedFilter },
        });
        expect(deleteResults.length === 0);
    });

    it('Should increment and decrement failed connection works', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const userId = createdUser._id as string;
        await userService.resetFailedConnection(createdUser);
        let currentUser = await userService.findById(userId);
        expect(currentUser.failedConnectionCount).toEqual(0);
        await userService.incrementFailedConnection(createdUser);
        currentUser = await userService.findById(userId);
        expect(currentUser.failedConnectionCount).toEqual(1);
    });

    it('Should set active flag works', async () => {
        const createdUser = await userService.create(toBeCreatedUser);
        const userId = createdUser._id as string;
        await userService.setActive(userId, false);
        expect((await userService.findById(userId)).isActive).toEqual(false);
    });

    it('Should batch insert user', async () => {
        const expected: BatchUserInsertReportDto = {
            successfulInsertionCount: 1,
            alreadyAddedToDatabaseCount: 0,
            failedInsertionCount: 0,
            importDurationInSeconds: 0,
            errorReports: [],
            processedInsertionCount: 0,
        };
        const result = await userService.batchInsert([toBeCreatedUser]);
        expect(result.successfulInsertionCount).toEqual(expected.successfulInsertionCount);
        expect(result.alreadyAddedToDatabaseCount).toEqual(expected.alreadyAddedToDatabaseCount);
        expect(result.importDurationInSeconds).toBeGreaterThanOrEqual(expected.importDurationInSeconds);
    });

    afterEach(async () => {
        await userRepository.model.deleteMany({}).exec();
        await tokenRequestRepository.model.deleteMany({}).exec();
        await mailNotificationRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await roleRepository.model.deleteMany({}).exec();
        await closeInMongodConnection(module, [
            tokenRequestCollectionName,
            userCollectionName,
            roleCollectionName,
            mailNotificationCollectionName,
        ]);
    });
});
