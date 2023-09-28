/* eslint-disable max-lines-per-function */

import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { Role, roleSchema } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

describe('RoleService', () => {
    let module: TestingModule;
    let roleController: RoleController;
    let roleRepository: RoleRepository;
    const roleCollectionName = generateCollectionName();

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([{ name: Role.name, schema: roleSchema, collection: roleCollectionName }]),
            ],
            providers: [RoleService, RoleRepository],
            controllers: [RoleController],
        }).compile();
        roleController = module.get<RoleController>(RoleController);
        roleRepository = module.get<RoleRepository>(RoleRepository);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Controller should be defined', () => {
        expect(roleController).toBeDefined();
    });

    afterEach(async () => {
        await roleRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [roleCollectionName]);
    });
});
