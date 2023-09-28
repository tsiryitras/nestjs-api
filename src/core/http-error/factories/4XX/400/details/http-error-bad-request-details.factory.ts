import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Bad Request HTTP Error.
 */
export class HttpErrorBadRequestDetailsFactory {
    /**
     * Creates the body of the response for a Bad Request HTTP error following the RFC7807
     * @param errorDetails Details about the error that need to be inserted in the body of the response
     * @param type URL that gives information about the resolution of the error if it exists
     * @returns A Bad Request error body formatted following the RFC7807
     */
    static create(errorDetails?: string, type?: string): HttpErrorDetails {
        return new HttpErrorsDetailsBuilder(
            'Bad Request',
            `The server was unable to process the request sent by the client due to invalid syntax. ${errorDetails}`
        )
            .setType(type)
            .setAdditionalInformation('errorDetails', errorDetails)
            .build();
    }
}
