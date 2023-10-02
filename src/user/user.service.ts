/* eslint-disable max-lines */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { DateTime } from "luxon";
import { AuthService } from "../auth/auth.service";
import { LoginResponseDto } from "../auth/dto/login-responce.dto";
import { CONFIGURATION_TOKEN_DI } from "../config/configuration-di.constant";
import { ConfigurationType } from "../config/configuration.interface";
import { PermissionName } from "../permission/entities/permission.entity";
import { Role, RoleType } from "../role/entities/role.entity";
import { RoleRepository } from "../role/role.repository";
import { RoleService } from "../role/role.service";
import { CsvExportCriteria } from "../shared/types/csv-export-criteria";
import { ListCriteria } from "../shared/types/list-criteria.class";
import { logObject } from "../shared/utils/log-object.utils";
import {
  TokenRequest,
  TokenRequestType,
} from "../token-request/entities/token-request.entity";
import { TokenRequestService } from "../token-request/token-request.service";
import {
  BatchInsertErrorReportType,
  BatchInsertErrorReport,
  BatchUserInsertReportDto,
} from "./dto/batch-insert-user-report.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { SaveUserFilterPayloadDto } from "./dto/save-user-filter-payload.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserFilter } from "./entities/user.entity";
import { PaginatedUsers } from "./paginated-users.interface";
import {
  EMPTY_BATCH_USER_INSERT_REPORT,
  USERS_SEARCH_FIELDS_WITH_MONGO_SEARCH,
  USERS_SEARCH_INDEX,
  USER_AUTOCOMPLETION_SEARCH_FIELD,
  USER_DEFAULT_FILTERS,
  USER_LOOKUP_STAGES,
  USER_SEARCH_FIELDS,
} from "./user.constants";
import { UserRepository } from "./user.repository";

/**
 * Service for User layer
 */
@Injectable()
export class UserService {
  /**
   * Constructor of UserService
   * @param userRepository Injected User Repository
   * @param roleRepository Injected RoleRepository
   * @param tokenRequestService Injected TokenRequestService
   * @param mailNotificationService Injected MailNotificationService
   * @param authService Injected AuthService
   * @param configuration Injected Application Configuration
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly tokenRequestService: TokenRequestService,
    private readonly roleService: RoleService,
    @Inject("authService") private readonly authService: AuthService,
    @Inject(CONFIGURATION_TOKEN_DI)
    private readonly configuration: ConfigurationType
  ) {}

  /**
   * Create User
   * @param createUserDto User to be created
   * @returns Created User
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const role = await this.roleRepository
      .findById(createUserDto.role as string)
      .lean()
      .exec();
    const createdUser: User = await this.userRepository.create({
      ...createUserDto,
      roleName: role.name, // Save role Name to facilitate the search
      creationDate: new Date(),
      filters: [...USER_DEFAULT_FILTERS],
    });
    await this.requestInitPassword(createdUser);
    return createdUser;
  }

  /**
   * Get paginated Users and list of entity names and user fullNames, based on list criteria
   * @param criteria criteria used to find Users
   * @returns Paginated Users
   */
  async getPaginated(criteria: ListCriteria): Promise<PaginatedUsers> {
    const paginatedUsers = await this.userRepository.getList(
      USERS_SEARCH_INDEX,
      criteria,
      USERS_SEARCH_FIELDS_WITH_MONGO_SEARCH,
      {
        "role.type": { $ne: RoleType.SUPER_ADMIN },
      }
    );
    return {
      ...paginatedUsers,
      entityNames: await this.userRepository
        .find({})
        .sort({ entity: 1 })
        .distinct("entity")
        .exec(),
      userFullNames: await this.userRepository
        .find({})
        .sort({ fullName: 1 })
        .distinct("fullName")
        .exec(),
    };
  }

  /**
   * Find User with specific _id
   * @param id _id of User
   * @returns User corresponding to id, otherwise undefined
   */
  async findOne(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id).populate("role");
  }

  /**
   * Find User by username
   * @param userName username of the User
   * @returns User corresponding to id, otherwise undefined
   */
  async findByUserName(userName: string): Promise<User | undefined> {
    return this.userRepository
      .findOne({ userName })
      .populate("role")
      .lean()
      .exec();
  }

  /**
   * Update User with specific Id
   * @param id Id of User
   * @param updateUserDto Partial of User containing the update
   * @returns Updated User
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository
      .findById(id)
      .populate("role")
      .lean()
      .exec();
    const newRole = await this.roleRepository
      .findById(updateUserDto.role as string)
      .lean()
      .exec();
    const updatedUser = await this.userRepository.update(id, {
      ...updateUserDto,
      roleName: newRole?.name,
    });
    await this.updateNbUsersOfRole(user.role as string);
    await this.updateNbUsersOfRole(updatedUser.role as string);
    return updatedUser;
  }

  /**
   * Check if there is duplication on email or userName
   * @param userToCheck Partial of User containing the email and userName to check
   * @returns boolean
   */
  async checkDuplication(userToCheck: UpdateUserDto): Promise<boolean> {
    const duplicationCount = await this.userRepository.count({
      $or: [{ email: userToCheck.email }, { userName: userToCheck.userName }],
    });
    return duplicationCount > 0;
  }

  /**
   * Update the nbUsers in concerned Role
   * @param id Id of role
   */
  async updateNbUsersOfRole(id: string) {
    await this.roleRepository.update(id, {
      nbUsers: await this.userRepository.count({ role: id }),
    });
  }

  /**
   * Find User by its _id
   * @param id Id of User
   * @returns User corresponding to _id, otherwise undefined
   */
  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  /**
   * Remove User with specific _id
   * @param id Id of User
   * @returns true if deletion is successful, false otherwise
   */
  remove(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  /**
   * Get Permission Names by User Id
   * @param userId User Id
   * @returns List of Permission Names affected to the user id
   */
  async getPermissionNamesByUserId(userId: string): Promise<PermissionName[]> {
    const user: User | undefined = await this.userRepository
      .findById(userId)
      .populate("role")
      .exec();
    if (!user) {
      return [];
    }
    return [
      ...new Set(
        (user.role as Role).permissions.map((permission) => permission.name)
      ),
    ];
  }

  /**
   * Find User by its email
   * @param email User email
   * @returns User if found, undefined otherwise
   */
  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ email }).lean().exec();
  }

  /**
   * Request password request for given user email
   * @param email User email
   */
  async requestPasswordReset(email: string) {
    const user: User | undefined = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        errorDetails: `L'utilisateur avec l'email ${email} n'existe pas. Veuillez contacter votre administrateur.`,
      });
    }
    const { token }: TokenRequest =
      await this.tokenRequestService.requestTokenForPasswordReset(user);
  }

  /**
   * Request password reinitialisation for given User
   * @param user Current User
   */
  async requestInitPassword(user: User) {
    const { token }: TokenRequest =
      await this.tokenRequestService.requestTokenForAccountCreation(user);
  }

  /**
   * Set isActive flag of the user
   * @param isActive is active
   */
  async setActive(userId: string, isActive: boolean) {
    await this.userRepository.update(userId, { isActive });
  }

  /**
   * Increment failed connection
   * @param user concerned user
   */
  async incrementFailedConnection(user: User) {
    await this.userRepository.update(user._id as string, {
      failedConnectionCount: (user?.failedConnectionCount ?? 0) + 1,
    });
  }

  /**
   * Reset failed connection
   * @param user concerned user
   */
  async resetFailedConnection(user: User) {
    await this.userRepository.update(user._id as string, {
      failedConnectionCount: 0,
    });
  }

  /**
   * Handle too many failed connection
   * @param user User with to many attempt
   */
  async handleTooManyFailedConnection(user: User) {
    const { token } =
      await this.tokenRequestService.requestTokenForPasswordReset(user);
  }

  /**
   * Get signed User that contains informations about user and jwt token
   * @param user User
   * @returns LoginResponseDto which contains information about user and jwt token
   */
  async getSignedUser(user: User): Promise<LoginResponseDto> {
    return this.authService.login(user);
  }

  /**
   * Reset User password
   * @param password New password
   * @param token Token used for password resetting
   * @returns LoginResponseDto which contains informations about user and jwt token
   */
  async resetPassword(
    password: string,
    token: string
  ): Promise<LoginResponseDto> {
    await this.tokenRequestService.checkTokenValidity(token, [
      TokenRequestType.RESET_PASSWORD,
      TokenRequestType.ACCOUNT_CREATION,
    ]);
    const user: User = await this.tokenRequestService.getUserByToken(token);
    await this.userRepository.model.populate(user, "role");
    await this.userRepository.update(user._id as string, {
      password: await bcrypt.hash(password, 10),
    });
    await this.tokenRequestService.markTokenAsUsed(token);
    await this.resetFailedConnection(user);
    await this.setActive(user._id as string, true);
    return this.getSignedUser(user);
  }

  /**
   * Update last connectionDate of User
   * @param userId User Id
   */
  async updateLastConnectionDate(userId: string) {
    await this.userRepository.model
      .findByIdAndUpdate(userId, {
        $set: { lastConnectionDate: new Date() },
      })
      .exec();
  }
}
