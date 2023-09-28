/* eslint-disable max-lines-per-function */

import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role, roleSchema } from './entities/role.entity';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

describe('RoleService', () => {
    let module: TestingModule;
    let roleService: RoleService;
    let roleRepository: RoleRepository;
    const roleCollectionName = generateCollectionName();

    const toBeCreatedRole: CreateRoleDto = {
        description: 'Role for testing purpose',
        name: 'Role name for test',
        permissions: [],
        nbPermissions: 0,
        nbUsers: 0,
    };

    const roles: CreateRoleDto[] = [
        toBeCreatedRole,
        {
            description: 'another role description',
            name: 'created role name 2',
            permissions: [],
            nbPermissions: 0,
            nbUsers: 0,
        },
    ];

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([{ name: Role.name, schema: roleSchema, collection: roleCollectionName }]),
            ],
            providers: [RoleService, RoleRepository],
        }).compile();
        roleService = module.get<RoleService>(RoleService);
        roleRepository = module.get<RoleRepository>(RoleRepository);
    }, 500000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should create role', async () => {
        await roleService.create(toBeCreatedRole);
        const result = await roleRepository.findOne({ name: toBeCreatedRole.name }).exec();
        expect(result.name).toEqual(toBeCreatedRole.name);
    });

    it('Should find created Role', async () => {
        const createdRole = await roleService.create(toBeCreatedRole);
        const result = await roleService.findOne(createdRole._id as string);
        expect(result.name).toEqual(toBeCreatedRole.name);
    });

    it('Should find all permissions', async () => {
        for (const role of roles) {
            await roleService.create(role);
        }
        const results: Role[] = await roleService.findAll();
        for (let i = 0; i < results.length; i++) {
            expect(results[i].name).toEqual(roles[i].name);
            expect(results[i].description).toEqual(roles[i].description);
        }
    });

    it('Role update should be effective', async () => {
        const expectedDescription = 'updated description';
        const inDatabaseCreatedRole = await roleService.create(toBeCreatedRole);
        await roleService.update(inDatabaseCreatedRole._id as string, { description: expectedDescription });
        const result = await roleService.findOne(inDatabaseCreatedRole._id as string);
        expect(result.description).toEqual(expectedDescription);
    });

    it('Remove role should be effective', async () => {
        const inDatabaseCreatedRole = await roleService.create(toBeCreatedRole);
        expect(await roleRepository.count({})).toEqual(1);
        await roleService.remove(inDatabaseCreatedRole._id as string);
        expect(await roleRepository.count({})).toEqual(0);
    });

    afterEach(async () => {
        await roleRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [roleCollectionName]);
    });
});
