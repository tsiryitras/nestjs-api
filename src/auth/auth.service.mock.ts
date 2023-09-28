import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { LoginResponseDto } from './dto/login-responce.dto';
/**
 * Mock implementation of Service for Authentication layer
 */
@Injectable()
export class AuthServiceMock {
    /**
     * Constructor for AuthService
     * @param userRepository
     * @param jwtService Injected Jwt Service
     */
    constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) {}

    /**
     * Check if username and password match the values inside database and return User
     * If user doesn't match, return null
     * @param userName user name
     * @param pass password
     * @returns a promise of User if valid, null otherwise
     */
    async validateUser(userName: string, pass: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ userName }).exec();

        if (user && (await bcrypt.compare(pass, user.password))) {
            return user;
        }
        return null;
    }

    /**
     * Log a user by returning informations about user and jwt token
     * @param User User generally from database
     * @returns Promise of LoginResponseDto which contains informations about the user and jwt token
     */
    async login({ password, ...user }: User): Promise<LoginResponseDto> {
        return {
            token: this.jwtService.sign({ userName: user.userName, _id: user._id }),
            user,
        };
    }
}
