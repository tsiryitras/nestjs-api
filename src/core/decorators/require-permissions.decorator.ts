import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../../permission/entities/permission.entity';

/**
 * Require permission key used for identifying require permission decorator
 */
export const REQUIRE_PERMISSIONS_KEY = 'REQUIRE_PERMISSIONS_KEY';

/**
 * Create RequirePermission Decortors
 * This decorator indicates the list of required permissions for the resource
 * @param permissionNames List of permissions
 * @returns Permission Decorator
 */
export const RequirePermissions = (...permissionNames: PermissionName[]) => SetMetadata(REQUIRE_PERMISSIONS_KEY, permissionNames);
