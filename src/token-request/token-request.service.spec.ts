/* eslint-disable max-lines-per-function */
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import configurationTest from '../config/configuration-test.constant';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User, userSchema } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { CreateTokenRequestDto } from './dto/create-token-request.dto';
import { TokenRequest, TokenRequestStatus, TokenRequestType, tokenRequestSchema } from './entities/token-request.entity';
import { TokenRequestRepository } from './token-request.repository';
import { TokenRequestService } from './token-request.service';

describe('TokenRequestService', () => {
    let module: TestingModule;
    let tokenRequestService: TokenRequestService;
    let tokenRequestRepository: TokenRequestRepository;
    let userRepository: UserRepository;
    let createdUser: User;
    const userCollectionName = generateCollectionName();
    const tokenRequestCollectionName = generateCollectionName();

    const toBeCreatedUser: CreateUserDto = {
        creationDate: new Date(),
        email: 'test@mail.mail',
        entity: 'entity',
        firstName: 'user',
        lastName: 'user',
        fromSso: false,
        fullName: 'user user',
        lastConnectionDate: new Date(),
        phone: '0000000',
        role: `${new mongoose.Types.ObjectId()}`,
        userName: 'user',
        filters: [],
        isActive: true,
    };

    const toBeCreatedTokenRequest: CreateTokenRequestDto = {
        expirationDate: new Date(),
        requestDate: new Date(),
        status: TokenRequestStatus.PENDING,
        type: TokenRequestType.ACCOUNT_CREATION,
        token: 'abcd',
        user: undefined,
        userMail: 'test@mail.mail',
    };

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    { name: TokenRequest.name, schema: tokenRequestSchema, collection: tokenRequestCollectionName },
                ]),
                MongooseModule.forFeature([{ name: User.name, schema: userSchema, collection: userCollectionName }]),
            ],
            providers: [
                TokenRequestService,
                TokenRequestRepository,
                {
                    provide: CONFIGURATION_TOKEN_DI,
                    useValue: configurationTest(),
                },
                UserRepository,
            ],
        }).compile();
        tokenRequestService = module.get<TokenRequestService>(TokenRequestService);
        tokenRequestRepository = module.get<TokenRequestRepository>(TokenRequestRepository);
        userRepository = module.get<UserRepository>(UserRepository);
        createdUser = await userRepository.create(toBeCreatedUser);
        toBeCreatedTokenRequest.user = createdUser;
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should find pending token', async () => {
        const { userMail } = toBeCreatedTokenRequest;
        const result1 = await tokenRequestService.isSomeRequestNewPasswordPending(userMail);
        expect(result1).toEqual(false);
        await tokenRequestRepository.create(toBeCreatedTokenRequest);
        const result2 = await tokenRequestService.isSomeRequestNewPasswordPending(userMail);
        expect(result2).toEqual(true);
    });

    it('Should request a new token for user', async () => {
        await tokenRequestService.requestToken(createdUser, TokenRequestType.ACCOUNT_CREATION);
        const result = await tokenRequestService.isSomeRequestNewPasswordPending(createdUser.email);
        expect(result).toEqual(true);
    });

    it('Should request token for account creation', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        expect(createdToken.type).toEqual(TokenRequestType.ACCOUNT_CREATION);
        const result = await tokenRequestService.isSomeRequestNewPasswordPending(createdUser.email);
        expect(result).toEqual(true);
    });

    it('Should request token for password reset', async () => {
        const createdToken = await tokenRequestService.requestTokenForPasswordReset(createdUser);
        expect(createdToken.type).toEqual(TokenRequestType.RESET_PASSWORD);
        const result = await tokenRequestService.isSomeRequestNewPasswordPending(createdUser.email);
        expect(result).toEqual(true);
    });

    it('Should mark token as used', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        await tokenRequestService.markTokenAsUsed(createdToken.token);
        const isSomeRequestPending = await tokenRequestService.isSomeRequestNewPasswordPending(createdUser.email);
        expect(isSomeRequestPending).toEqual(false);
    });

    it('Should mark token as expired', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        await tokenRequestService.markTokenAsExpired(createdToken.token);
        const isSomeRequestPending = await tokenRequestService.isSomeRequestNewPasswordPending(createdUser.email);
        expect(isSomeRequestPending).toEqual(false);
    });

    it('Should not mark current token as expired', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        const evaluatedToken = await tokenRequestService.evaluateTokenExpiration(createdToken);
        expect(evaluatedToken.status).toEqual(TokenRequestStatus.PENDING);
    });

    it('Should mark token created last year to be expired', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        createdToken.expirationDate = DateTime.fromJSDate(createdToken.expirationDate).minus({ year: 1 }).toJSDate();
        const evaluatedToken = await tokenRequestService.evaluateTokenExpiration(createdToken);
        expect(evaluatedToken.status).toEqual(TokenRequestStatus.EXPIRED);
    });

    it('Should get user by token', async () => {
        const createdToken = await tokenRequestService.requestTokenForAccountCreation(createdUser);
        const user = await tokenRequestService.getUserByToken(createdToken.token);
        expect(user.email).toEqual(createdUser.email);
    });

    afterEach(async () => {
        await tokenRequestRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await userRepository.model.deleteMany({}).exec();
        await closeInMongodConnection(module, [tokenRequestCollectionName, userCollectionName]);
    });
});
