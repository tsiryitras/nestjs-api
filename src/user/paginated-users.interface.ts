import { Paginated } from '../shared/types/page.interface';
import { User } from './entities/user.entity';

export interface PaginatedUsers extends Paginated<User> {
    entityNames: string[];
    userFullNames: string[];
}
