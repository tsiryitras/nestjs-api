import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigurationType } from './configuration.interface';

/**
 * Swagger configuration based on app configuration
 * Specify title, description and version of the application
 * @param app Instance of Application
 * @param configuration Instance of configuration
 */
export const configureSwagger = (app: INestApplication, configuration: ConfigurationType) => {
    const configs = new DocumentBuilder()
        .setTitle(configuration.app.title)
        .setDescription(configuration.app.description)
        .setVersion(configuration.app.version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, configs);
    SwaggerModule.setup(configuration.app.apiExplorerPath, app, document);
};
