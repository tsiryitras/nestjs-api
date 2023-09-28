import { ValidationError } from '@nestjs/common';

/**
 * Helper service that processes a {@link ValidationError} array into a single string to facilitate the processing of
 * errors following our standards (i.e. RFC7807)
 */
export class ValidationErrorConverterService {
  /**
   * Converts {@link ValidationError} array into a single string by concatenating the constraints that triggered the
   * error in class validator library. It is a requirement to handle properly our errors through
   * {@link ErrorsInterceptor} with the right format, following the RFC7807
   * @param validationErrorList List of {@link ValidationError} that the NestJS Class Validator ValidationPipe has
   *   built.
   * @returns a single string that can be used as errorDetails. Each constraint is concatenated to form a bullet point
   *   list.
   * @example
   * ```
   * - triviaQuestionList should not be empty
   * - triviaQuestionList must contain at least 6 elements
   * ```
   */
  public static convert(validationErrorList: ValidationError[]): string {
    return this.getValidConstraints(validationErrorList)
      .map(constraints => ValidationErrorConverterService.convertObjectToValueArray(constraints))
      .flatMap((stringList: string[]) => stringList.map(s => `\n- ${s}`))
      .join('');
  }

  /**
   * Converts an object containing keys and value as string, into a string array.
   * @param object Object having a key/string value dynamic
   * @returns a string array containing all the string values that were associated with the object keys.
   * @private
   */
  private static convertObjectToValueArray(object: { [x: string]: string }): string[] {
    return Object.keys(object).map(key => object[key]);
  }

  /**
   * Allows to recover all the constraints of the validation errors in a recursive way.
   * @param validationErrorList
   * @private
   */
  private static getValidConstraints(validationErrorList: ValidationError[]): { [x: string]: string }[] {
    if (!validationErrorList || !validationErrorList.length) {
      return [{ error: 'Unknown validation error list!' }];
    }

    return validationErrorList.reduce<{ [x: string]: string }[]>((constraints, validationError) => {
      if (validationError.constraints) {
        return [...constraints, validationError.constraints];
      }

      if (validationError.children && validationError.children.length) {
        return [...constraints, ...this.getValidConstraints(validationError.children)];
      }

      return [...constraints, { error: 'Unknown validation error constraints!' }];
    }, []);
  }
}
