import { Logger } from '@nestjs/common';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';

/**
 * Custom print function for winston
 * @param value Object send by winston
 * @param message message send by winston
 * @param stack stack of error
 * @returns custom print function for winston
 */
export const printValueOrMessage = (
    value: object,
    message: string | object,
    stack: { originalStack: string; trackingId: string }
) => {
    if (value) {
        return JSON.stringify(value, null, 2);
    }
    if (stack) {
        return `${stack.trackingId} - ${stack.originalStack}`;
    }
    return message;
};

/**
 * print format for winston console
 */
export const printFormat = winston.format.printf((input) => {
    const { level, message, timestamp, value, stack } = input;
    return `${timestamp} - ${level}: ${printValueOrMessage(value, message, stack)}`;
});

/**
 * return winston format based on flag isMorganFormat
 * if it's an http request return info, otherwiser return false
 * @param isMorganFormat flag for isMorganFormat
 * @returns winston format
 */
const filterMorganFormat = (isMorganFormat: boolean) =>
    winston.format((info, opts) => {
        const message = JSON.stringify(info);

        if (isMorganFormat === /GET \/|POST \/|PUT \/|DELETE \/|PATCH \//.test(message)) {
            return info;
        }

        return false;
    });

/**
 * Return winston format for error
 */
export const errorFormat = winston.format((error) => {
    if (error.stack) {
        return { ...error, stack: error.stack[0] }; // unwind the array containing only a lonely value
    }
    return error;
})();

/**
 * Winston console log option
 */
export const WINSTON_CONSOLE_LOG_OPTION: ConsoleTransportOptions = {
    format: winston.format.combine(
        errorFormat,
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.colorize(),
        printFormat
    ),
};

/**
 * Options used by winston for logging
 */
export const USED_WINSTON_MODULE_OPTIONS: WinstonModuleOptions = {
    exceptionHandlers: [new winston.transports.File({ filename: './logs/exceptions.log' })],
    exitOnError: false,
    transports: [
        // Log as text on Console
        new winston.transports.Console(WINSTON_CONSOLE_LOG_OPTION),
        // Log as json for files
        new winston.transports.DailyRotateFile({
            filename: './logs/nestjs-api-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            json: true,
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '7d',
            format: winston.format.combine(
                errorFormat,
                filterMorganFormat(false)(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                winston.format.json()
            ),
        }),
        new winston.transports.DailyRotateFile({
            filename: './logs/morgan-nestjs-api-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            json: true,
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '7d',
            format: filterMorganFormat(true)(),
        }),
    ],
};

/**
 * Custom class for morgan stream
 */
class MorganStream {
    /**
     * write text to stream
     * @param text text to write to stream
     */
    write(text: string) {
        Logger.log(`${text.trim()}`);
    }
}

/**
 * instance of morgan stream
 */
export const morganStream = new MorganStream();
