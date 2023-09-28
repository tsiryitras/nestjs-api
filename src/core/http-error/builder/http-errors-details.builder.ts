import { IllegalArgumentError } from '../../errors/illegal-argument.error';
import { HttpErrorDetails } from '../rfc7807/http-error-details';

/**
 * Class to build Http Errors
 */
export class HttpErrorsDetailsBuilder {
    /**
     * Error details of http errors details builder
     */
    private readonly errorDetails: HttpErrorDetails;

    /**
     * Constructor for HttpErrorDetailBuilder
     * @param title title of error
     * @param detail detail of error
     */
    constructor(title: string, detail?: string) {
        this.errorDetails = {
            title,
            detail,
            type: 'about:blank',
        };
    }

    /**
     * Sets additional key that can be useful to describe the error in more detail with capturable field for the client of
     * the endpoint.
     * Must be a key different from the one defined in the constructor or that have a setter (i.e. Type, title, detail)
     *
     * @param key Key name to add as additional information
     * @param value Value of the key for the additional information. Can be any JSON type. Can be null or undefined.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    setAdditionalInformation<T>(key: string, value: T): HttpErrorsDetailsBuilder {
        if (!key) {
            throw new IllegalArgumentError('Key must be defined');
        }
        if (key === 'type' || key === 'title' || key === 'detail') {
            throw new IllegalArgumentError('Key passed must be different from the normal keys provided in the constructor');
        }
        this.errorDetails[key] = value;

        return this;
    }

    /**
     * Sets the URI to find more information about this error
     * @param type A defined URI
     */
    setType(type: string): HttpErrorsDetailsBuilder {
        if (!type) {
            return this;
        }
        this.errorDetails.type = type;

        return this;
    }

    /**
     * Build Http Error Details
     * @returns HttpError Details
     */
    build(): HttpErrorDetails {
        return { ...this.errorDetails } as HttpErrorDetails;
    }
}
