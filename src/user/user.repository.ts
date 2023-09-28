import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../core/base.repository';
import { User, UserDocument } from './entities/user.entity';

/**
 * Repository of User layer
 * Extends BaseRepository
 */
@Injectable()
export class UserRepository extends BaseRepository<UserDocument, User> {
    /**
     * Constructor for UserRepository
     * @param model Injected model
     */
    constructor(@InjectModel(User.name) model) {
        super(model);
    }
}
