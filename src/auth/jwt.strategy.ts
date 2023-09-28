import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationType } from '../config/configuration.interface';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

/**
 * Strategy used by passport for jwt validation
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * Constructor of JwtStrategy Class
     * @param configuration Injected configuration
     * @param userService Injected User Service
     */
    constructor(
        @Inject('CONFIGURATION_TOKEN_DI') readonly configuration: ConfigurationType,
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configuration.jwt.secretKey,
        });
    }

    /**
     * Return the user found based on _id and username
     * @param payload Partial information about the user
     * @returns User found inside database
     */
    async validate(payload: Pick<User, '_id' | 'userName'>) {
        const user = await this.userService.findById(payload._id as string);
        return user;
    }
}
