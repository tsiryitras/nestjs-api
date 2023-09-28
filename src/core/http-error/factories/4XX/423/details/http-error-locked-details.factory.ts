import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Locked HTTP Error.
 */
export class HttpErrorLockedDetailsFactory {
  /**
   * Creates the body of the response for a Locked HTTP error following the RFC7807
   * @param errorDetails Details about the error that need to be inserted in the body of the response
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Locked error body formatted following the RFC7807
   */
  static create(errorDetails: string, type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder('Locked', `The source or destination resource is locked. ${errorDetails}`)
      .setType(type)
      .setAdditionalInformation('errorDetails', errorDetails)
      .build();
  }
}
