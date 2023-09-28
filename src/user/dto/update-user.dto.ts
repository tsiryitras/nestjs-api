import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
/**
 * Dto used for User update
 * UpdateUserDto is a partial of User
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
