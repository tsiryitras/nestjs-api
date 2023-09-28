import { UserFilter } from '../entities/user.entity';

/**
 * Payload used to save user filter
 */
export interface SaveUserFilterPayloadDto {
    /**
     * Id of the user
     */
    userId: string;

    /**
     * Name of the filter
     */
    filter: UserFilter;
}
