import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Bad Gateway HTTP Error.
 */
export class HttpErrorBadGatewayDetailsFactory {
  /**
   * Creates the body of the response for a Bad Gateway HTTP error following the RFC7807
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Bad Gateway error body formatted following the RFC7807
   */
  static create(type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder(
      'Bad Gateway',
      'The server encountered a temporary error and could not complete your request.',
    )
      .setType(type)
      .build();
  }
}
