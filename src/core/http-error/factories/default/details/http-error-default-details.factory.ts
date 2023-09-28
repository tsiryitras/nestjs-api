import { HttpErrorsDetailsBuilder } from '../../../builder/http-errors-details.builder';
import { HttpErrorDetails } from '../../../rfc7807/http-error-details';
import { IllegalArgumentError } from '../../../../errors/illegal-argument.error';

/**
 * Generator of the response payload for a HTTP Error following the RFC7807.
 */
export class HttpErrorDefaultDetailsFactory {
  /**
   * Creates the body of the response for a HTTP error following the RFC7807
   * @param title Title of the error that needs to be added in the payload from RFC7807. Needs to be defined.
   * @param details Details about the error that needs to be added in the payload from RFC7807
   * @param type URL that gives information about the resolution of the error if it exists
   * @returns A error body formatted following the RFC7807
   */
  static create(title: string, details?: string, type?: string): HttpErrorDetails {
    if (!title) {
      throw new IllegalArgumentError('Title is undefined or null');
    }
    return new HttpErrorsDetailsBuilder(title, details).setType(type).build();
  }
}
