import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Request Timeout HTTP Error.
 */
export class HttpErrorRequestTimeoutDetailsFactory {
  /**
   * Creates the body of the response for a Request Timeout HTTP error following the RFC7807
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Request Timeout error body formatted following the RFC7807
   */
  static create(type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder('Request Timeout', 'The request has timeout.').setType(type).build();
  }
}
