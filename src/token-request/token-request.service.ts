import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import { ConfigurationType } from '../config/configuration.interface';
import { User } from '../user/entities/user.entity';
import { TokenRequest, TokenRequestStatus, TokenRequestType } from './entities/token-request.entity';
import { TokenRequestRepository } from './token-request.repository';

/**
 * Service for TokenRequest layer
 */
@Injectable()
export class TokenRequestService {
    /**
     * Constructor for TokenRequestService
     * @param tokenRequestRepository Injected TokenRequest Repository
     * @param configuration Injected configuration
     */
    constructor(
        private readonly tokenRequestRepository: TokenRequestRepository,
        @Inject(CONFIGURATION_TOKEN_DI) private readonly configuration: ConfigurationType
    ) {}

    /**
     * Check if there is some request of new password pending for a given user mail
     * @param email User email
     * @returns true if there is some request new password pending for the given user mail, false otherwise
     */
    async isSomeRequestNewPasswordPending(email: string): Promise<boolean> {
        return (await this.tokenRequestRepository.count({ userMail: email, status: TokenRequestStatus.PENDING })) > 0;
    }

    /**
     * Generate uniq token
     * Before returning the token, verify if there is the same token inside database, otherwiser generate another one
     * @returns a token
     */
    async generateNewToken(): Promise<string> {
        const token = nanoid();
        if ((await this.tokenRequestRepository.count({ token })) > 0) {
            return this.generateNewToken();
        }
        return token;
    }

    /**
     * Request a token generation for a specific user, with a given type
     * @param user User for whom the token will be generated
     * @param type Type of token to be generated
     * @returns generated token
     */
    async requestToken(user: User, type: TokenRequestType): Promise<TokenRequest> {
        const tokenExpirationDelay = this.configuration.requestToken.requestTokenExpirationForForgottenPassword;
        const { email } = user;

        const existingToken: TokenRequest | undefined = await this.tokenRequestRepository
            .findOne({
                userMail: email,
                status: TokenRequestStatus.PENDING,
            })
            .exec();

        if (existingToken) {
            const evaluatedToken = await this.evaluateTokenExpiration(existingToken);
            return evaluatedToken.status === TokenRequestStatus.EXPIRED ? this.requestToken(user, type) : evaluatedToken;
        }

        return this.tokenRequestRepository.create({
            expirationDate: DateTime.now().plus({ minutes: tokenExpirationDelay }).toJSDate(),
            requestDate: new Date(),
            status: TokenRequestStatus.PENDING,
            token: await this.generateNewToken(),
            type,
            user,
            userMail: email,
        });
    }

    /**
     * Generate a token for password reset type
     * @param user User
     * @returns generated token for password Reset
     */
    async requestTokenForPasswordReset(user: User): Promise<TokenRequest> {
        return this.requestToken(user, TokenRequestType.RESET_PASSWORD);
    }

    /**
     * GEnerate a token for account creation type
     * @param user User
     * @returns generated token for account creation
     */
    async requestTokenForAccountCreation(user: User): Promise<TokenRequest> {
        return this.requestToken(user, TokenRequestType.ACCOUNT_CREATION);
    }

    /**
     * Mark a token as used
     * @param token The token
     */
    async markTokenAsUsed(token: string) {
        await this.tokenRequestRepository.model
            .findOneAndUpdate({ token }, { status: TokenRequestStatus.USED, usageDate: new Date() })
            .exec();
    }

    /**
     * Find inside database and mark the token as used
     * @param token The token
     */
    async markTokenAsExpired(token: string) {
        await this.tokenRequestRepository.model.findOneAndUpdate({ token }, { status: TokenRequestStatus.EXPIRED }).exec();
    }

    /**
     * Evaluate and update the field isExpired of TokenRequest
     * @param tokenRequest The concerned TokenRequest
     * @returns Evaluated request token
     */
    async evaluateTokenExpiration(tokenRequest: TokenRequest): Promise<TokenRequest> {
        const isExpirationDatePassed = DateTime.now() > DateTime.fromJSDate(tokenRequest.expirationDate);
        if (isExpirationDatePassed) {
            await this.markTokenAsExpired(tokenRequest.token);
            return this.tokenRequestRepository
                .findById(tokenRequest._id as string)
                .lean()
                .exec();
        }
        return tokenRequest;
    }

    /**
     * Check token validity
     * The token is valid if it is not used nor expired
     * @param token The given token
     * @param types The types of token that will be checked
     * @returns true if token is still valid, false otherwise
     */
    async checkTokenValidity(
        token: string,
        types: TokenRequestType[] = [TokenRequestType.ACCOUNT_CREATION, TokenRequestType.RESET_PASSWORD]
    ): Promise<boolean> {
        const tokenRequest: TokenRequest | undefined = await this.tokenRequestRepository
            .findOne({
                type: { $in: types },
                token,
            })
            .lean()
            .exec();
        if (!tokenRequest) {
            throw new BadRequestException({
                errorDetails: 'Lien non valide',
            });
        }
        if (tokenRequest.status !== TokenRequestStatus.PENDING) {
            throw new BadRequestException({
                errorDetails: 'Token déjà utilisé ou expiré',
            });
        }
        const evaluatedTokenRequest = await this.evaluateTokenExpiration(tokenRequest);
        if (evaluatedTokenRequest.status === TokenRequestStatus.EXPIRED) {
            throw new BadRequestException({
                errorDetails: 'Lien expiré',
            });
        }
        return true;
    }

    /**
     * Get User by Token
     * @param token The given token
     * @returns The user affected to token
     */
    async getUserByToken(token: string): Promise<User> {
        const request: TokenRequest = await this.tokenRequestRepository
            .findOne({
                token,
            })
            .populate('user')
            .lean()
            .exec();
        return request.user as User;
    }
}
