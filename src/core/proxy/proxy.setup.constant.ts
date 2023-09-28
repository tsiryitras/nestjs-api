import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ConfigurationType } from '../../config/configuration.interface';
import { ProxyRouteConfig } from './proxy-configuration.constant';

/**
 * Setup http-middleware-proxy
 * @param app Application instance
 * @param configuration Configuration instance
 * @param routes Proxy route configuration instance
 */
export const setupProxy = (app: NestFastifyApplication, configuration: ConfigurationType, routes: ProxyRouteConfig[]) => {
    routes.forEach((r) => {
        app.use(`${r.url}`, createProxyMiddleware(r.proxy));
    });
};
