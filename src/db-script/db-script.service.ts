import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseRepository } from '../core/base.repository';
import { DbScriptRepository } from './db-script.repository';
import { DbScript } from './entities/db-script.entity';

/**
 * Service for DbScript layer
 */
@Injectable()
export class DbScriptService {
    /**
     * Constructor for DbScriptService
     * @param dbScriptRepository Injected DbScriptRepository
     * @param connection Inject mongo connection
     */
    constructor(private readonly dbScriptRepository: DbScriptRepository, @InjectConnection() private readonly connection) {}

    /**
     * find first dbScript that meet criteria
     * @param criteria search criteria
     * @returns found dbScript
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findOne(criteria: any): Promise<DbScript | null> {
        return this.dbScriptRepository.findOne(criteria).exec();
    }

    /**
     * Create dbScript
     * @param item dbScript which will be created
     * @returns created dbScript
     */
    async create(item: DbScript): Promise<DbScript> {
        return this.dbScriptRepository.create(item);
    }

    /**
     * Generate Base repository based on class name
     * can be used like this: dbScriptService.getRepository(Request)
     * @param classConstructor Name of the class, example: Request
     * @returns Repository based on Collection of the same name
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getRepository<T>(classConstructor: new (...args: any[]) => T): Promise<BaseRepository<HydratedDocument<T>, T>> {
        const model = this.connection.model(classConstructor.name);
        return new (class extends BaseRepository<HydratedDocument<T>, T> {})(model);
    }
}
