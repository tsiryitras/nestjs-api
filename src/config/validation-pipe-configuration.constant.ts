import { BadRequestException, ValidationError, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ValidationErrorConverterService } from '../core/interceptors/validation-error-converter.service';

/**
 * Options used by class-validator library
 */
const validationOptions: ValidationPipeOptions = {
    skipMissingProperties: false,
    validationError: { target: false },
    enableDebugMessages: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new BadRequestException({ errorDetails: ValidationErrorConverterService.convert(validationErrors) }),
};

/**
 * get instance of validation pipe (used by class-validator library)
 * @returns validation pipe based on validation option
 */
export const getValidationPipe = () => new ValidationPipe(validationOptions);
