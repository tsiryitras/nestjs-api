import { OmitType } from '@nestjs/swagger';
import { Role } from '../entities/role.entity';

/**
 * Dto used for Role Creation
 * Same as Role but omit _id
 */
export class CreateRoleDto extends OmitType(Role, ['_id']) {}
