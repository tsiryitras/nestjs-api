import * as faker from "faker";
import { Permission } from "../../permission/entities/permission.entity";
import { PermissionRepository } from "../../permission/permission.repository";
import { CreateRoleDto } from "../../role/dto/create-role.dto";
import { Role, RoleType } from "../../role/entities/role.entity";
import { RoleRepository } from "../../role/role.repository";
import { takeOneRandomlyFrom } from "../../shared/utils/faker.utils";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { User } from "../../user/entities/user.entity";
import { DbScriptService } from "../db-script.service";
import { ScriptFn } from "../dto/script-fn.interface";
import { USER_DEFAULT_FILTERS } from "./../../user/user.constants";
import { UserRepository } from "./../../user/user.repository";
/**
 * GENERATED USERS
 */
const USERS_NB = 50;

/**
 * List of mock entities
 */
const MOCK_ENTITIES = ["AIRFRANCE", "DISPATCH", "BOVIS"];

/**
 * number of roles to be generated
 */
const ROLES_NB = 5;

/**
 * Role names used for generating mock data
 */
const ROLE_NAMES = [
  "ADMINISTRATEUR 1",
  "ADMINISTRATEUR 2",
  "RESPONSABLE 1",
  "RESPONSABLE 2",
  "RESPONSABLE 3",
];

/**
 * Insert roles mock data
 * @param dbScriptService DbScript Instance
 */
const insertRolesMockData: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const roles: CreateRoleDto[] = Array.from(
    new Array(ROLES_NB),
    (x, i): CreateRoleDto => ({
      description: faker.random.words(4),
      name: ROLE_NAMES[i],
      permissions: [],
      nbPermissions: 0,
      nbUsers: 0,
    })
  );
  for (const role of roles) {
    await roleRepository.create(role);
  }
};

/**
 * Insert user mock data
 * @param dbScriptService DbScriptService instance
 */
const insertUsersMockData: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const roles: Role[] = await roleRepository.find({}).lean().exec();
  const users: CreateUserDto[] = Array.from(
    new Array(USERS_NB),
    (): CreateUserDto => {
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      return {
        firstName,
        lastName,
        fullName: `${lastName} ${firstName}`,
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        creationDate: faker.date.recent(),
        lastConnectionDate: faker.date.recent(),
        role: takeOneRandomlyFrom(roles),
        userName: firstName,
        filters: USER_DEFAULT_FILTERS,
        isActive: true,
      };
    }
  );
  for (const user of users) {
    await userRepository.create(user);
  }
};

/**
 * Update roles mock data to be full permissions
 * @param dbScriptService DbScriptService instance
 */
const updateRolesMockDatasToBeFullPermissions = async (
  dbScriptService: DbScriptService
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const rolesMock: Role[] = await roleRepository
    .find({ "role.type": { $ne: RoleType.SUPER_ADMIN } })
    .lean()
    .exec();
  const permissionRepository = (await dbScriptService.getRepository(
    Permission
  )) as PermissionRepository;
  const permissions: Permission[] = await permissionRepository
    .find({})
    .lean()
    .exec();
  for (const role of rolesMock) {
    await roleRepository.update(role._id as string, { permissions });
  }
};

/**
 * Get users count by role
 * @param roleId
 * @param dbScriptService
 * @returns count of users by Role
 */
const getUsersCountByRole = async (
  roleId: string,
  dbScriptService: DbScriptService
) => {
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;
  const usersCount = await userRepository.count({ role: roleId });
  return usersCount;
};

/**
 * Update roles mock data to set nbPersmissions and nbUsers
 * @param dbScriptService
 */
const updateRolesMockDatasToGetPermissionsAndUsersCount = async (
  dbScriptService: DbScriptService
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const rolesMock: Role[] = await roleRepository
    .find({ "role.type": { $ne: RoleType.SUPER_ADMIN } })
    .lean()
    .exec();
  for (const role of rolesMock) {
    const nbPermissions = role.permissions.length;
    const nbUsers = await getUsersCountByRole(
      role._id as string,
      dbScriptService
    );
    await roleRepository.update(role._id as string, {
      nbPermissions,
      nbUsers,
    });
  }
};

const updateRoleNameForUsersMockData: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;

  const users: User[] = await userRepository.find({}).lean().exec();
  for (const user of users) {
    const role: Role = await roleRepository
      .findOne({ _id: user.role })
      .lean()
      .exec();
    await userRepository.update(user._id as string, {
      roleName: role.name,
    });
  }
};

const activateAllCurrentUsers: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;
  await userRepository.model.updateMany({}, { $set: { isActive: true } });
};

/**
 *  holds list of scripts that will be executed forl 1.0.1
 */
export const scripts: ScriptFn[] = [
  insertRolesMockData,
  insertUsersMockData,
  updateRolesMockDatasToBeFullPermissions,
  updateRolesMockDatasToGetPermissionsAndUsersCount,
  updateRoleNameForUsersMockData,
  activateAllCurrentUsers,
];
