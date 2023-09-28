import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply } from 'fastify';
import { HttpErrorUnauthorizedFactory } from '../core/http-error/factories/4XX/401/http-error-bad-request.factory';

/**
 * Guard that extends local Authentication Guard
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    /**
     * Check if current route is accessible
     * @param context Execution context
     * @returns Promise of boolean that specify if current resource is accessible or not
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const reply: FastifyReply = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        try {
            await super.canActivate(context);
            return request.user;
        } catch (err) {
            HttpErrorUnauthorizedFactory.create(reply, '');
            return false;
        }
    }
}
