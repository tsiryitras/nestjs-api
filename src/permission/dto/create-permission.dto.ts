import { OmitType } from '@nestjs/swagger';
import { Permission } from '../entities/permission.entity';

/**
 * Dto used for Permission creation
 * Same as Permission but omit _id
 */
export class CreatePermissionDto extends OmitType(Permission, ['_id']) {}
