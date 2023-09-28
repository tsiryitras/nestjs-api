/* eslint-disable max-lines-per-function */
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { DbScriptRepository } from './db-script.repository';
import { DbScriptService } from './db-script.service';
import { DbScript, DbScriptSchema } from './entities/db-script.entity';

describe('DbScriptService', () => {
    let module: TestingModule;
    let dbScriptService: DbScriptService;
    let dbScriptRepository: DbScriptRepository;
    const dbScriptCollectionName = generateCollectionName();

    const toBeCreatedDbScript: DbScript = {
        filename: 'script.ts',
        script: 'some script to be executed',
    };

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    {
                        name: DbScript.name,
                        schema: DbScriptSchema,
                        collection: dbScriptCollectionName,
                    },
                ]),
            ],
            providers: [DbScriptRepository, DbScriptService],
        }).compile();
        dbScriptService = module.get<DbScriptService>(DbScriptService);
        dbScriptRepository = module.get<DbScriptRepository>(DbScriptRepository);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should create dbScript', async () => {
        const createdDbScript = await dbScriptService.create(toBeCreatedDbScript);
        const result = await dbScriptService.findOne({
            filename: toBeCreatedDbScript.filename,
        });
        expect(result.script).toEqual(toBeCreatedDbScript.script);
    });

    it('Should return correct Repository', async () => {
        const createdRepository = (await dbScriptService.getRepository(DbScript)) as DbScriptRepository;
        const createdDbScript = await dbScriptService.create(toBeCreatedDbScript);
        const result = await createdRepository
            .findOne({
                filename: toBeCreatedDbScript.filename,
            })
            .exec();
        expect(result.script).toEqual(toBeCreatedDbScript.script);
    });

    afterEach(async () => {
        await dbScriptRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [dbScriptCollectionName]);
    });
});
