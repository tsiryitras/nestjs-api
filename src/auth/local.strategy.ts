import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';

/**
 * Strategy used by passport for local strategy
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    /**
     * Constructor of Local Strategy Class
     * @param authService Injected Auth Service
     */
    constructor(private readonly authService: AuthService) {
        super({ usernameField: 'login' });
    }

    /**
     * Validate user based on login and password
     * @param login login of the user
     * @param password password of the user
     * @returns Promise of the user if the login and password match, otherwise raise a forbidden error
     */
    async validate(login: string, password: string): Promise<User> {
        return this.authService.validateUser(login, password);
    }
}
