import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Service Unavailable HTTP Error.
 */
export class HttpErrorServiceUnavailableDetailsFactory {
  /**
   * Creates the body of the response for a Service Unavailable HTTP error following the RFC7807
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Service Unavailable error body formatted following the RFC7807
   */
  static create(type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder(
      'Service Unavailable',
      'The server is temporarily unable to complete your request due to maintenance downtime or capacity problems. Please try again later.',
    )
      .setType(type)
      .build();
  }
}
