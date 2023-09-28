import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../core/base.repository';
import { DbScript, DbScriptDocument } from './entities/db-script.entity';

/**
 * Repository for DbScript layer
 * Extends BaseRepository
 */
@Injectable()
export class DbScriptRepository extends BaseRepository<DbScriptDocument, DbScript> {
    /**
     * Constructor for DbScriptRepository
     * @param model Injected Model
     */
    constructor(@InjectModel(DbScript.name) model: Model<DbScriptDocument>) {
        super(model);
    }
}
