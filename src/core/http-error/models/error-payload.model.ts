/**
 * Represents Server error
 */
export interface ServerError {
    /**
     * Opional error status
     */
    status?: number;

    /**
     * Error message
     */
    message: string;

    /**
     * Optional error name
     */
    name?: string;
}
