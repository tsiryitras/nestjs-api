import configuration from "../../config/configuration.constant";
import {
  Permission,
  PermissionCategory,
  PermissionName,
} from "../../permission/entities/permission.entity";
import { PermissionRepository } from "../../permission/permission.repository";
import { Role, RoleType } from "../../role/entities/role.entity";
import { RoleRepository } from "../../role/role.repository";
import { User } from "../../user/entities/user.entity";
import { USER_DEFAULT_FILTERS } from "../../user/user.constants";
import { UserRepository } from "../../user/user.repository";
import { DbScriptService } from "../db-script.service";
import { ScriptFn } from "../dto/script-fn.interface";

/**
 * Create Super Admin User with username and password from configuration (.env)
 * @param dbScriptService DbScriptService instance
 */
const createSuperAdminUser: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;
  await userRepository.create({
    email: "admin@email.com",
    firstName: "SUPER_ADMIN",
    lastName: "SUPER_ADMIN",
    fullName: "SUPER_ADMIN",
    userName: configuration().superAdmin.login,
    password: configuration().superAdmin.password,
    role: null,
    creationDate: new Date(),
    lastConnectionDate: null,
    phone: "",
    filters: [...USER_DEFAULT_FILTERS],
    isActive: true,
  });
};

/**
 * Create Super admin role
 * @param dbScriptService DbscriptService instance
 */
const createSuperAdminRole: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const userRepository = (await dbScriptService.getRepository(
    User
  )) as UserRepository;

  const role = await roleRepository.create({
    description: "SUPER_ADMIN Role",
    name: "SUPER_ADMIN_ROLE",
    type: RoleType.SUPER_ADMIN,
    permissions: [],
    nbPermissions: 0,
    nbUsers: 0,
  });

  await userRepository.model
    .findOneAndUpdate(
      { userName: configuration().superAdmin.login },
      { $set: { role: role._id } }
    )
    .exec();
};

/**
 * Create User default role
 */
const createUserDefaultRole: ScriptFn = async (
  dbScriptService: DbScriptService
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  await roleRepository.create({
    description: "Rôle par défaut pour tout nouveau utilisateur",
    name: "Nouveau utilisateur",
    type: RoleType.NEW_USER_DEFAULT_ROLE,
    permissions: [],
    nbPermissions: 0,
    nbUsers: 0,
  });
};

/**
 * Represent a Categorized Permission
 */
interface CategorizedPermission {
  /**
   * Permission Category
   */
  category: PermissionCategory;

  /**
   * List of permission names
   */
  permissionNames: PermissionName[];
}

/**
 * Insert Categorized permissions to super admin role
 * @param dbScriptService Instance of dbScriptService
 * @param categorizedPermissions List of CategorizedPermission
 */
const insertCategorizedPermissionsToSuperAdminRole = async (
  dbScriptService: DbScriptService,
  categorizedPermissions: CategorizedPermission[]
) => {
  const roleRepository = (await dbScriptService.getRepository(
    Role
  )) as RoleRepository;
  const permissionRepository = (await dbScriptService.getRepository(
    Permission
  )) as PermissionRepository;
  const permissions: Permission[] = [];
  for (const { category, permissionNames } of categorizedPermissions) {
    for (const name of permissionNames) {
      permissions.push(
        await permissionRepository.create({
          category,
          name,
        })
      );
    }
  }

  await roleRepository.model
    .findOneAndUpdate({ name: "SUPER_ADMIN_ROLE" }, { $push: { permissions } })
    .exec();
};

/**
 * Insert User relative permissions to super admin role
 * @param dbScriptService DbScriptService instance
 * @returns void
 */
const insertUserdPermissions: ScriptFn = (dbScriptService: DbScriptService) =>
  insertCategorizedPermissionsToSuperAdminRole(dbScriptService, [
    {
      category: PermissionCategory.USER,
      permissionNames: [
        PermissionName.VIEW_USER,
        PermissionName.CREATE_USER,
        PermissionName.EDIT_USER,
        PermissionName.DELETE_USER,
      ],
    },
  ]);

/**
 * Insert Role relative permissions into Super admin role
 * @param dbScriptService DbScriptService instance
 * @returns void
 */
const insertRoledPermissions: ScriptFn = (dbScriptService: DbScriptService) =>
  insertCategorizedPermissionsToSuperAdminRole(dbScriptService, [
    {
      category: PermissionCategory.ROLE,
      permissionNames: [
        PermissionName.VIEW_ROLE,
        PermissionName.CREATE_ROLE,
        PermissionName.EDIT_ROLE,
        PermissionName.DELETE_ROLE,
      ],
    },
  ]);

/**
 * holds list of scripts that will be executed
 */
export const scripts: ScriptFn[] = [
  createSuperAdminUser,
  createSuperAdminRole,
  createUserDefaultRole,
  insertRoledPermissions,
  insertUserdPermissions,
];
