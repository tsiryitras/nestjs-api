import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Not Found HTTP Error.
 */
export class HttpErrorNotFoundDetailsFactory {
  /**
   * Creates the body of the response for a Not Found HTTP error following the RFC7807
   * @param resourceName Name of the resource that triggered the error, that often is the name of the scope like user,
   *   role, ...
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Not Found error body formatted following the RFC7807
   */
  static create(resourceName: string, type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder('Not Found', `The resource ‘${resourceName}’ cannot be found.`)
      .setType(type)
      .setAdditionalInformation('resourceName', resourceName)
      .build();
  }
}
