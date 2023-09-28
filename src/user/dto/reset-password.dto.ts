/**
 * Dto used to reset user password
 */
export class ResetPasswordDto {
    /**
     * Token used to reset user password
     */
    token: string;

    /**
     * The new password
     */
    password: string;
}
