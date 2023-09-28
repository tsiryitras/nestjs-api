import { OmitType } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
/**
 * Dto returned for user part after login , same as user but exclude password because password should not be visible inside request response
 */
class LoginResponseUser extends OmitType(User, ['password']) {}

/**
 * Dto returned after login
 */
export class LoginResponseDto {
    /**
     * User information
     */
    user: LoginResponseUser;

    /**
     * JWT token
     */
    token: string;
}
