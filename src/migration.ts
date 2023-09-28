import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { Logger } from '@nestjs/common';
import { CONFIGURATION_TOKEN_DI } from './config/configuration-di.constant';
import { ConfigurationType } from './config/configuration.interface';
import { configureSwagger } from './config/swagger-configuration.constant';
import { ErrorsInterceptor } from './core/interceptors/errors.interceptor';
import { launchDbScripts } from './db-script/db-script.launcher';
import { DbScriptService } from './db-script/db-script.service';
import { MigrationModule } from './migration.module';

/**
 * Bootstrap migration
 */
async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(MigrationModule, new FastifyAdapter({ trustProxy: true }), {
        // logger: WinstonModule.createLogger(MIGRATION_WINSTON_MODULE_OPTIONS),
    });
    const configuration = app.get<ConfigurationType>(CONFIGURATION_TOKEN_DI);
    configureSwagger(app, configuration);
    app.useGlobalInterceptors(new ErrorsInterceptor());
    const dbScriptService: DbScriptService = app.get(DbScriptService);
    await launchDbScripts(dbScriptService);
    Logger.log('=========== End Of Migration ==========');
    app.close();
}
bootstrap();
