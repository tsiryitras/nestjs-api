import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CONFIGURATION_TOKEN_DI } from '../../config/configuration-di.constant';
import { ConfigurationType } from '../../config/configuration.interface';
import { PermissionName } from '../../permission/entities/permission.entity';
import { UserService } from '../../user/user.service';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

/**
 * Guard that prevent user without specified permission to access the resource
 */
@Injectable()
export class RequirePermissionsGuard extends AuthGuard('jwt') implements CanActivate {
    /**
     * Contrucotr of RequirePermissionGuard Class
     * @param reflector Injected reflector
     * @param userService Injected User Service
     * @param jwtService Injected Jwt Service
     * @param configuration Injected Configuration
     */
    constructor(
        private readonly reflector: Reflector,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(CONFIGURATION_TOKEN_DI) private readonly configuration: ConfigurationType
    ) {
        super();
    }

    /**
     * check if the user has the permission to access the resource
     * Can be applied to fucntion or to controller
     * @param context execution context
     * @returns Promise of boolean, true if the user has the required permission, false otherwise
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissionNames = this.reflector.getAllAndOverride<PermissionName[]>(REQUIRE_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissionNames) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const bearerToken = request.headers.authorization; // Assuming that the bearer token is passed in the 'Authorization' header

        if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
            return false;
        }

        const token = bearerToken.substring(7); // Remove the 'Bearer ' prefix

        let user;
        try {
            user = this.jwtService.verify(token, {
                secret: this.configuration.jwt.secretKey,
            });
        } catch (error) {
            return false;
        }
        const permissionNames: PermissionName[] = await this.userService.getPermissionNamesByUserId(user._id);
        return requiredPermissionNames.some((requiredPermissionName) =>
            permissionNames.some((permissionName) => permissionName === requiredPermissionName)
        );
    }
}
