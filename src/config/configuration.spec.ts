import { ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configurationTestConstant from './configuration-test.constant';
import configuration from './configuration.constant';
import { ConfigurationType } from './configuration.interface';

const testConfiguration: ConfigurationType = configurationTestConstant();

describe('Configuration Service Test', () => {
    let config: ConfigType<typeof configuration>;
    const configurationToken = 'CONFIGURATION_TOKEN';
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [{ provide: configurationToken, useValue: testConfiguration }],
        }).compile();

        config = module.get<ConfigurationType>(configurationToken);
    });

    it('Should retrieve correct database name', async () => {
        const databaseName = 'unit-test';
        expect(config.mongo.database).toEqual(databaseName);
    });
});
