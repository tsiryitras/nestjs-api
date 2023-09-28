import { HttpErrorsDetailsBuilder } from '../../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

/**
 * Generator of the response payload for a Conflict HTTP Error.
 */
export class HttpErrorConflictDetailsFactory {
  /**
   * Creates the body of the response for a Conflict HTTP error following the RFC7807
   * @param resourceName Name of the resource that triggered the error, that often is the name of the scope like user,
   *   role, ...
   * @param propertyName Value that has conflicted in the scope
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A Conflict error body formatted following the RFC7807
   */
  static create(resourceName: string, propertyName: string, type?: string): HttpErrorDetails {
    return new HttpErrorsDetailsBuilder(
      'Conflict',
      `A ${resourceName} with the following ${propertyName} already exists.`,
    )
      .setType(type)
      .setAdditionalInformation('resourceName', resourceName)
      .setAdditionalInformation('propertyName', propertyName)
      .build();
  }
}
