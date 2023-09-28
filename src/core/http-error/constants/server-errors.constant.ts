import { HttpStatus } from '@nestjs/common';

/**
 * Errors bundle returned to the frontend
 */
export const SERVER_ERRORS_BY_STATUS = {
  500: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    name: 'Internal server error',
    message:
      'An unexpected error has occurred during login process. Please, contact your administrator for more assistance.',
  },
};
