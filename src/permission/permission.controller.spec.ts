/* eslint-disable max-lines-per-function */
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { Permission, permissionSchema } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './permission.service';

describe('Permission controller', () => {
    let module: TestingModule;
    let permissionRepository: PermissionRepository;
    let permissionController: PermissionController;
    const permissionCollectionName = generateCollectionName();

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    {
                        name: Permission.name,
                        schema: permissionSchema,
                        collection: permissionCollectionName,
                    },
                ]),
            ],
            providers: [PermissionRepository, PermissionService],
            controllers: [PermissionController],
        }).compile();
        permissionRepository = module.get<PermissionRepository>(PermissionRepository);
        permissionController = module.get<PermissionController>(PermissionController);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Controller should be defined', () => {
        expect(permissionController).toBeDefined();
    });

    afterEach(async () => {
        await permissionRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [permissionCollectionName]);
    });
});
