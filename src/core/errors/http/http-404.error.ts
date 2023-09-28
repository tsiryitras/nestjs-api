/**
 * Error that must produce an HTTP Error response with the status 404.
 * It must be used when a resource is not found.
 */
export class Http404Error extends Error {
    /**
     * Name  of http404 error
     */
    name = 'Http404Error';

    /**
     * Constructor
     *
     * @param message message to display
     */
    constructor(message?: string) {
        super(message || 'Not Found');
    }
}
