import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, roleSchema } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Role.name, schema: roleSchema }])],
    controllers: [RoleController],
    providers: [RoleService, RoleRepository],
    exports: [RoleRepository, RoleService],
})
export class RoleModule {}
