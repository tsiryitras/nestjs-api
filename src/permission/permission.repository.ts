import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../core/base.repository';
import { Permission, PermissionDocument } from './entities/permission.entity';

/**
 * Repository for Permission layer
 * Extends BaseRepository
 */
@Injectable()
export class PermissionRepository extends BaseRepository<PermissionDocument, Permission> {
    /**
     * Constructor for PermissionRepository
     * @param model Injected Model
     */
    constructor(@InjectModel(Permission.name) model) {
        super(model);
    }
}
