/* eslint-disable max-lines-per-function */
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import configurationTest from '../config/configuration-test.constant';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { User, userSchema } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { TokenRequest, tokenRequestSchema } from './entities/token-request.entity';
import { TokenRequestController } from './token-request.controller';
import { TokenRequestRepository } from './token-request.repository';
import { TokenRequestService } from './token-request.service';

describe('TokenRequestService', () => {
    let module: TestingModule;
    let tokenRequestController: TokenRequestController;
    let tokenRequestRepository: TokenRequestRepository;
    const tokenRequestCollectionName = generateCollectionName();
    const userCollectionName = generateCollectionName();

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
            controllers: [TokenRequestController],
        }).compile();
        tokenRequestController = module.get<TokenRequestController>(TokenRequestController);
        tokenRequestRepository = module.get<TokenRequestRepository>(TokenRequestRepository);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Controller should be defined', () => {
        expect(tokenRequestController).toBeDefined();
    });

    afterEach(async () => {
        await tokenRequestRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [userCollectionName, tokenRequestCollectionName]);
    });
});
