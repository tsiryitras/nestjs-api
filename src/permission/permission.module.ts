import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, permissionSchema } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repository';
import { PermissionService } from './permission.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Permission.name,
                schema: permissionSchema,
            },
        ]),
    ],
    controllers: [PermissionController],
    providers: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
