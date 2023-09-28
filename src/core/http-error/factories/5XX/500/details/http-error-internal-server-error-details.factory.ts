import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for an Internal Server Error HTTP Error.
 */
export class HttpErrorInternalServerErrorDetailsFactory {
    /**
     * Creates the body of the response for a Internal Server Error HTTP error following the RFC7807
     * @param trackingIdentifier Identifier that helps the bug tracking and is mandatory to retrieve what happened in the
     *   backend on a specific ticket
     * @param type URL that gives information about the resolution of the error if it exists
     * @returns An Internal Server Error error body formatted following the RFC7807
     */
    static create(trackingIdentifier: string, type?: string): HttpErrorDetails {
        return new HttpErrorsDetailsBuilder(
            'Internal Server Error',
            // eslint-disable-next-line max-len
            `An unexpected error has occurred. Please, record the tracking identifier ${trackingIdentifier} for this request and contact your administrator for more assistance.`
        )
            .setType(type)
            .setAdditionalInformation('trackingIdentifier', trackingIdentifier)
            .build();
    }
}
