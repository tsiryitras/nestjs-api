import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../services/http-response/http-response.service';
import { SERVER_ERRORS_BY_STATUS } from '../constants/server-errors.constant';
import { HttpErrorDefaultFactory } from '../factories/default/http-error-default.factory';
import { ServerError } from '../models/error-payload.model';
import { ServerErrorResponseOptions } from '../models/server-error-response-options.model';

/**
 * Handler used to send server errors back to the frontend
 */
export class ServerErrorHandler {
    /**
     * Sends, according to the status code, the expected error to the frontend.
     * @param serverError
     * @param res
     * @param options
     * @private
     */
    public static sendServerErrorByStatus(
        serverError: ServerError,
        res: FastifyReply,
        options: ServerErrorResponseOptions = { stream: false }
    ) {
        const errorByStatus: {
            httpStatus: number;
            name: string;
            message: string;
        } = SERVER_ERRORS_BY_STATUS[serverError.status ? serverError.status : 500];

        if (!options.stream) {
            if (errorByStatus) {
                HttpErrorDefaultFactory.create(res, errorByStatus.httpStatus, errorByStatus.name, errorByStatus.message);
                return;
            }

            HttpErrorDefaultFactory.create(res, serverError.status, serverError.name, serverError.message);
            return;
        }

        if (errorByStatus) {
            HttpResponseService.sendStreamError(
                res,
                errorByStatus.httpStatus,
                errorByStatus.name,
                errorByStatus.message,
                options.headers
            );
            return;
        }

        HttpResponseService.sendStreamError(res, serverError.status, serverError.name, serverError.message, options.headers);
    }
}
