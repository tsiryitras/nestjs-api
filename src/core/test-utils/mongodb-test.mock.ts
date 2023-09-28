import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { nanoid } from 'nanoid';
import configurationTestConstant from '../../config/configuration-test.constant';

/**
 * Get a function that generate custom test module
 * @param customOpts custom options for generating test module
 * @returns function that generate custom test module
 */
export const mongooseTestModule = (connectionName?: string) =>
    MongooseModule.forRoot(configurationTestConstant().mongo.MAIN_DATABASE_URI, {
        ...(connectionName
            ? {
                  connectionName,
              }
            : {}),
    });

/**
 * Function which close mongodb connection
 */
export const closeInMongodConnection = async (module: TestingModule, collections: string[]) => {
    const connection = module.get<Connection>(getConnectionToken());
    if (connection) {
        await Promise.all(
            collections.map(async (collection) => {
                await connection.dropCollection(collection);
            })
        );
        await connection.close();
    }
};

export const generateCollectionName = (): string => nanoid();
