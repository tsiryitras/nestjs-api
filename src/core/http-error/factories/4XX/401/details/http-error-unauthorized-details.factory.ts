import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Unauthorized HTTP Error.
 */
export class HttpErrorUnauthorizedDetailsFactory {
    /**
     * Creates the body of the response for a Unauthorized HTTP error following the RFC7807
     * @param errorDetails Details about the error that need to be inserted in the body of the response
     * @param type URL that gives information about the resolution of the error if it exists
     * @returns A Unauthorized error body formatted following the RFC7807
     */
    static create(errorDetails?: string, type?: string): HttpErrorDetails {
        return new HttpErrorsDetailsBuilder('Unauthorized', `The credentials is not valid. ${errorDetails}`)
            .setType(type)
            .build();
    }
}
