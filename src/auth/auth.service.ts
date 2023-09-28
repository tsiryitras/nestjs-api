import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ConfigurationType } from "../config/configuration.interface";
import { ExternalApiCaller } from "../shared/external-api-caller.class";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { MAX_AUTHORIZED_FAILED_CONNECTION_COUNT } from "./auth.constant";
import { LoginResponseDto } from "./dto/login-responce.dto";
/**
 * Service for Authentication layer
 */
@Injectable()
export class AuthService {
    /**
     * External api caller of auth service
     */
    private readonly externalApiCaller: ExternalApiCaller =
        new ExternalApiCaller("Captcha google");

    /**
     * Constructor for AuthService
     * @param userService Injected User Service
     * @param jwtService Injected Jwt Service
     */
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject("CONFIGURATION_TOKEN_DI")
        readonly configuration: ConfigurationType
    ) {}

    /**
     * Check if username and password match the values inside database and return User
     * If user doesn't match, return null
     * @param userName user name
     * @param pass password
     * @returns a promise of User if valid, null otherwise
     */
    async validateUser(userName: string, pass: string): Promise<User | null> {
        const user = await this.userService.findByUserName(userName);
        const exceedFailedConnectionCount =
            (user.failedConnectionCount || 0) >=
            MAX_AUTHORIZED_FAILED_CONNECTION_COUNT - 1;

        if (
            !exceedFailedConnectionCount &&
            user &&
            (await bcrypt.compare(pass, user.password))
        ) {
            await this.userService.updateLastConnectionDate(user._id as string);
            await this.userService.resetFailedConnection(user);
            return user;
        }

        if (exceedFailedConnectionCount) {
            await this.handleFailedConnection(user);
        }
        await this.userService.incrementFailedConnection(user);
        return null;
    }

    private async sleep(sleepTimeInMilliseconds: number) {
        return new Promise((resolve) =>
            setTimeout(() => resolve({}), sleepTimeInMilliseconds)
        );
    }

    /**
     *
     * @param user User with failed connection count
     */
    async handleFailedConnection(user: User) {
        // sleep during 3 seconds to prevent brute force
        await this.sleep(3000);
        if (user.isActive) {
            await this.userService.setActive(user._id as string, false);
            await this.userService.handleTooManyFailedConnection(user);
        }
    }

    /**
     * Log a user by returning informations about user and jwt token
     * @param User User generally from database
     * @returns Promise of LoginResponseDto which contains informations about the user and jwt token
     */
    async login({ password, ...user }: User): Promise<LoginResponseDto> {
        return {
            token: this.jwtService.sign({
                userName: user.userName,
                _id: user._id,
            }),
            user,
        };
    }
}
