/* eslint-disable complexity */
import {
    BadGatewayException,
    BadRequestException,
    CallHandler,
    ConflictException,
    ExecutionContext,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
    NotFoundException,
    RequestTimeoutException,
    ServiceUnavailableException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { catchError } from 'rxjs/internal/operators/catchError';
import { HttpErrorBadRequestFactory } from '../http-error/factories/4XX/400/http-error-bad-request.factory';
import { HttpErrorNotFoundFactory } from '../http-error/factories/4XX/404/http-error-not-found.factory';
import { HttpErrorRequestTimeoutFactory } from '../http-error/factories/4XX/408/http-error-request-timeout.factory';
import { HttpErrorConflictFactory } from '../http-error/factories/4XX/409/http-error-conflict.factory';
import { HttpErrorInternalServerErrorFactory } from '../http-error/factories/5XX/500/http-error-internal-server-error.factory';
import { HttpErrorBadGatewayFactory } from '../http-error/factories/5XX/502/http-error-bad-gateway.factory';
import { HttpErrorServiceUnavailableFactory } from '../http-error/factories/5XX/503/http-error-service-unavailable.factory';
import { HttpErrorDefaultFactory } from '../http-error/factories/default/http-error-default.factory';

/**
 * Intercepts the output flow of the controllers to handle any error that migrate to the top level of the API.
 * It provides various responses corresponding to the format required for some precise requirements about HTTP
 * responses. In any cases, there is a default fallback for anything unhandled to transform it into an Internal Server
 * Error that ensure that the backend is perfectly sealed at the controller level. It gives some warranties about
 * security, and avoid any unwanted data to be served to the client, that could give information to malicious persons
 * about how the backend is made.
 */
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    /**
     * Intercepts the output flow of controllers and provides an appropriate error response in any case
     * @param context Details about the current request pipeline.
     * @param next Access to the response stream
     */
    // eslint-disable-next-line max-lines-per-function, @typescript-eslint/no-explicit-any
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            // eslint-disable-next-line max-lines-per-function
            catchError((error) => {
                const res = context.switchToHttp().getResponse<FastifyReply>();
                switch (error) {
                    case error instanceof BadRequestException: // 400
                        HttpErrorBadRequestFactory.create(res, error.response?.errorDetails);
                        break;
                    case error instanceof UnauthorizedException: // 401
                        HttpErrorDefaultFactory.create(res, HttpStatus.UNAUTHORIZED, 'Unauthorized', error.message);
                        break;
                    case error instanceof NotFoundException: // 404
                        HttpErrorNotFoundFactory.create(res, error.response?.resourceName);
                        break;
                    case error instanceof RequestTimeoutException: // 408
                        HttpErrorRequestTimeoutFactory.create(res);
                        break;
                    case error instanceof ConflictException: // 409
                        HttpErrorConflictFactory.create(res, error.response?.resourceName, error.response?.propertyName);
                        break;
                    case error instanceof UnprocessableEntityException: // 422
                        HttpErrorDefaultFactory.create(
                            res,
                            HttpStatus.UNPROCESSABLE_ENTITY,
                            'Unprocessable Entity',
                            error.message
                        );
                        break;
                    case error instanceof BadGatewayException: // 502
                        HttpErrorBadGatewayFactory.create(res);
                        break;
                    case error instanceof ServiceUnavailableException: // 503
                        HttpErrorServiceUnavailableFactory.create(res);
                        break;
                    default: // 500 & non caught errors
                        Logger.error(
                            error.message,
                            { originalStack: error.stack, trackingId: HttpErrorInternalServerErrorFactory.create(res) },
                            'ErrorsInterceptor'
                        );
                }
                return of({});
            })
        );
    }
}
