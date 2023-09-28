import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { printFormat, WINSTON_CONSOLE_LOG_OPTION } from './logger.configuration';

/**
 * Winston options used to log morgan streams (http requests)
 */
export const MIGRATION_WINSTON_MODULE_OPTIONS: WinstonModuleOptions = {
    exceptionHandlers: [new winston.transports.File({ filename: './logs/exceptions.log' })],
    exitOnError: false,
    transports: [
        // Log as text on Console
        new winston.transports.Console(WINSTON_CONSOLE_LOG_OPTION),
        new winston.transports.DailyRotateFile({
            filename: './logs/migration-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            json: true,
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '7d',
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), printFormat),
        }),
    ],
};
