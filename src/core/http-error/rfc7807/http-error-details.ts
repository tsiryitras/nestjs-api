/**
 * Error structure following the RFC-7807 for HTTP response in case of error from the backend
 */

export interface HttpErrorDetails {
    /**
     * URI to find the resolution of the error if it exists
     * @private
     */
    type: string;
    /**
     * Name of the error that occurred
     */
    readonly title: string;
    /**
     * Details that gives precision about the nature of the error.
     */
    readonly detail?: string;

    /**
     * Additional keys that can be provided to give more details and variables that can support process on the recipient
     * side without the need of parse anything in the details
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any;
}
