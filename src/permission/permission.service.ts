import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './permission.repository';

/**
 * Service for Permission layer
 */
@Injectable()
export class PermissionService {
    /**
     * Constructor for PermissionService
     * @param permissionRepository Injected Permission Repository
     */
    constructor(private readonly permissionRepository: PermissionRepository) {}

    /**
     * Create Permission
     * @param createPermissionDto Permission which will be created
     * @returns created permission
     */
    async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        return this.permissionRepository.create(createPermissionDto);
    }

    /**
     * Find all Permissions
     * @returns Promise of all Permissions inside database
     */
    findAll(): Promise<Permission[]> {
        return this.permissionRepository.find({});
    }

    /**
     * Find Permission with specific id
     * @param id Id of Permission
     * @returns Permission corresponding to id, otherwise undefined
     */
    findOne(id: string): Promise<Permission | undefined> {
        return this.permissionRepository.findById(id);
    }

    /**
     * Update Permission with specific Id
     * @param id Id of Permission
     * @param updatePermissionDto Partial of Permission containing the update
     * @returns Updated Permission
     */
    update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        return this.permissionRepository.update(id, updatePermissionDto);
    }

    /**
     * Remove Permission with specific id
     * @param id Id of Permission
     * @returns true if deletion is successful
     */
    remove(id: string): Promise<boolean> {
        return this.permissionRepository.delete(id);
    }
}
