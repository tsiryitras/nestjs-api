import { Options } from 'http-proxy-middleware';
import { ConfigurationType } from '../../config/configuration.interface';

/**
 * Proxy Route configuration interface
 */
export interface ProxyRouteConfig {
    /**
     * url of the proxy
     */
    url: string;

    /**
     * true if the specified route need authentication, false otherwise
     */
    auth: boolean;

    /**
     * Proxy options according to http-proxy-middleware specifications options
     */
    proxy: Options;
}

/**
 * Get an instance of ProxyRouteConfig[]
 * @param configuration instance of configuration
 * @returns function that generate an array of ProxyRouteConfig
 */
export const getProxyRoutes = (configuration: ConfigurationType): ProxyRouteConfig[] => [
    {
        url: '/backend',
        auth: false,
        proxy: {
            target: configuration.proxy.BACKEND_URL,
            changeOrigin: true,
            pathRewrite: {
                ['/backend']: '',
            },
        },
    },
    // Proxy for backend socket
    {
        url: '/backend-socket',
        auth: false,
        proxy: {
            target: configuration.proxy.BACKEND_SOCKET,
            changeOrigin: true,
            pathRewrite: {
                ['/backend-socket']: '',
            },
        },
    },
];
