import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../core/base.repository';
import { Role, RoleDocument } from './entities/role.entity';

/**
 * Repository for Role layer
 * Extends BaseRepository
 */
@Injectable()
export class RoleRepository extends BaseRepository<RoleDocument, Role> {
    /**
     * Constructor for RoleRepository
     * @param model Injected Model
     */
    constructor(@InjectModel(Role.name) model) {
        super(model);
    }
}
