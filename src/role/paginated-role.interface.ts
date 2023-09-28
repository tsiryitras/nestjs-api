import { Paginated } from '../shared/types/page.interface';
import { Role } from './entities/role.entity';

export interface PaginatedRole extends Paginated<Role> {
    roleNames: string[];
}
