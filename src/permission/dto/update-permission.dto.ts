import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
/**
 * Dto used for Permission update
 * UpdatePermissionDto is a partial of Permission
 */
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
