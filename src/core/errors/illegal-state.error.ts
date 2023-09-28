/**
 * Error thrown when a class contract is not fulfilled and when it cannot perform the task with such state
 */
export class IllegalStateError extends Error {
    /**
     * Name  of illegal state error
     */
    name = 'IllegalStateError';

    /**
     * Constructor
     *
     * @param message message of the error that will be shown in the stacktrace
     */
    constructor(message?: string) {
        super(message || 'The current class is not in an acceptable state to continue to perform the required tasks');
    }
}
