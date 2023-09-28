/* eslint-disable max-lines-per-function */
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from '../core/test-utils/mongodb-test.mock';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission, PermissionCategory, PermissionName, permissionSchema } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
    let module: TestingModule;
    let permissionService: PermissionService;
    let permissionRepository: PermissionRepository;
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
        }).compile();
        permissionService = module.get<PermissionService>(PermissionService);
        permissionRepository = module.get<PermissionRepository>(PermissionRepository);
    }, 50000);

    it('Test module should be defined', () => {
        expect(module).toBeDefined();
    });

    it('Should create permission', async () => {
        const expectedCreatedPermissionName = PermissionName.VIEW_DASHBOARD;
        await permissionService.create({
            category: PermissionCategory.DASHBOARD,
            name: expectedCreatedPermissionName,
        });
        const result = await permissionRepository.findOne({ name: expectedCreatedPermissionName }).exec();
        expect(result.name).toEqual(expectedCreatedPermissionName);
    });

    it('Should find view dashboard permission', async () => {
        const expectedDashboardPermissionName = PermissionName.VIEW_DASHBOARD;
        const createdPermission = await permissionService.create({
            category: PermissionCategory.DASHBOARD,
            name: expectedDashboardPermissionName,
        });
        const result = await permissionService.findOne(createdPermission._id as string);
        expect(result.name).toEqual(expectedDashboardPermissionName);
    });

    it('Should find All permissions', async () => {
        const permissions: CreatePermissionDto[] = [
            {
                category: PermissionCategory.DASHBOARD,
                name: PermissionName.VIEW_DASHBOARD,
            },
            {
                category: PermissionCategory.ROLE,
                name: PermissionName.VIEW_ROLE,
            },
        ];
        for (const permission of permissions) {
            await permissionService.create(permission);
        }
        const results: Permission[] = await permissionService.findAll();
        expect(results.length).toEqual(2);
        for (let i = 0; i < results.length; i++) {
            expect(results[i].category).toEqual(permissions[i].category);
            expect(results[i].name).toEqual(permissions[i].name);
        }
    });

    it('Update should be effective', async () => {
        const createdPermission: CreatePermissionDto = {
            category: PermissionCategory.DASHBOARD,
            name: PermissionName.VIEW_USER,
        };
        const inDatabaseCreatedPermission = await permissionService.create(createdPermission);
        await permissionService.update(inDatabaseCreatedPermission._id as string, { name: PermissionName.VIEW_DASHBOARD });
        const result = await permissionService.findOne(inDatabaseCreatedPermission._id as string);
        expect(result.name).toEqual(PermissionName.VIEW_DASHBOARD);
    });

    it('Remove should be effective', async () => {
        const toBeRemovedPermission = await permissionService.create({
            category: PermissionCategory.DASHBOARD,
            name: PermissionName.VIEW_DASHBOARD,
        });
        expect(await permissionRepository.count({})).toEqual(1);
        await permissionService.remove(toBeRemovedPermission._id as string);
        expect(await permissionRepository.count({})).toEqual(0);
    });

    afterEach(async () => {
        await permissionRepository.model.deleteMany({}).exec();
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [permissionCollectionName]);
    });
});
