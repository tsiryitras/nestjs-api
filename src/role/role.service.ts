import { Injectable } from '@nestjs/common';
import { ListCriteria } from '../shared/types/list-criteria.class';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleType } from './entities/role.entity';
import { PaginatedRole } from './paginated-role.interface';
import { ROLES_SEARCH_FIELDS_WITH_MONGO_SEARCH, ROLES_SEARCH_INDEX } from './role.constants';
import { RoleRepository } from './role.repository';

/**
 * Service for Role layer
 */
@Injectable()
export class RoleService {
    /**
     * Constructor of roleService
     * @param roleRepository Injected Role Repository
     * @param userService Injected User Service
     */
    constructor(private readonly roleRepository: RoleRepository) {}

    /**
     * Get paginated Roles based on list criteria
     * @param criteria Criteria used to filter Roles
     * @returns Paginated Roles, roleNames and roleDescriptions for filter
     */
    async getPaginated(criteria: ListCriteria): Promise<PaginatedRole> {
        const paginatedRoles = await this.roleRepository.getList(
            ROLES_SEARCH_INDEX,
            criteria,
            ROLES_SEARCH_FIELDS_WITH_MONGO_SEARCH,
            {
                type: { $ne: RoleType.SUPER_ADMIN },
            }
        );

        return {
            ...paginatedRoles,
            roleNames: await this.roleRepository
                .find({ type: { $ne: RoleType.SUPER_ADMIN } })
                .sort({ name: 1 })
                .distinct('name')
                .exec(),
        };
    }

    /**
     * Get list of all Roles
     * @returns List of all Roles
     */
    findAll(): Promise<Role[]> {
        return this.roleRepository.find({ type: { $ne: RoleType.SUPER_ADMIN } });
    }

    /**
     * Find Role with specific id
     * @param id _id of Role
     * @returns Role corresponding to id, otherwise undefined
     */
    async findOne(id: string): Promise<Role | undefined> {
        return this.roleRepository.findById(id);
    }

    /**
     * Create a Role
     * @param createRoleDto Role to be created
     * @returns Created Role
     */
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        return this.roleRepository.create(createRoleDto);
    }

    /**
     * Update Role with specific Id
     * @param id Id of Role
     * @param updateRoleDto Partial of Role containing the update
     * @returns Updated Role
     */
    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const updatedRole = await this.roleRepository.update(id, updateRoleDto);
        this.updateNbPermissionsOfRole(updatedRole);
        return updatedRole;
    }

    /**
     * Update nbPermissions of role
     * @param role Role to update
     */
    async updateNbPermissionsOfRole(role: Role) {
        const nbPermissions = role.permissions.length;
        await this.roleRepository.update(role._id as string, { ...role, nbPermissions });
    }

    /**
     * Remove Role with specific id
     * @param id Id of Role
     * @returns true if deletion is successful
     */
    async remove(id: string): Promise<boolean> {
        return this.roleRepository.delete(id);
    }

    /**
     * Get a list of suggestions for autocomplete
     * @param query query string
     * @returns list of suggestions
     */
    getRequestSuggestions(query: string): Promise<string[]> {
        return this.roleRepository.getAutocompleteSuggestions(ROLES_SEARCH_INDEX, query, ROLES_SEARCH_FIELDS_WITH_MONGO_SEARCH);
    }
}
