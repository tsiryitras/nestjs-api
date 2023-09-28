import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/**
 * Dto used for Role update
 * UpdateRoleDto is partial of Role
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
