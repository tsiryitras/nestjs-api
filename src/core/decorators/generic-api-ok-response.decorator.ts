import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiResponseMetadata, getSchemaPath } from '@nestjs/swagger';
import { GenericResponse } from '../types/generic-response.interface';

/**
 * Generic type for dto returned inside controller
 * tye type DataDto will be put inside type field
 */
interface TypedApiResponseOption<DataDto extends Type<unknown>> extends ApiResponseMetadata {
    /**
     * type of dto
     */
    type: DataDto;
}

/**
 * Create a decorator based on ApiResponseMetaData
 * this decorator specify that the dto is located inside data field of the response
 * @param options options based on ApiResponseMetadata
 * @returns TypedApiResponseOption
 */
export const GenericApiOkResponse = <DataDto extends Type<unknown>>({ type, ...options }: TypedApiResponseOption<DataDto>) =>
    applyDecorators(
        ApiExtraModels(GenericResponse, type),
        ApiOkResponse({
            ...options,
            schema: {
                allOf: [
                    {
                        $ref: getSchemaPath(GenericResponse),
                    },
                    {
                        properties: {
                            data: {
                                ...(options.isArray
                                    ? { type: 'array', items: { $ref: getSchemaPath(type) } }
                                    : { $ref: getSchemaPath(type) }),
                            },
                        },
                    },
                ],
            },
        })
    );
