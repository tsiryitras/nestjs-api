/**
 * Error thrown when a precondition of a method is not fulfilled and when it cannot perform the task with such data
 */
export class IllegalArgumentError extends Error {
    /**
     * Name  of illegal argument error
     */
    name = 'IllegalArgumentError';

    /**
     * Constructor
     *
     * @param message message of the error that will be shown in the stacktrace
     */
    constructor(message?: string) {
        super(message || 'One (or more) arguments are not allowed in this method.');
    }
}
