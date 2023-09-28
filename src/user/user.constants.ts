import { BatchUserInsertReportDto } from './dto/batch-insert-user-report.dto';
import { Table, UserFilter } from './entities/user.entity';

/**
 * User fields where search will be applied
 */
export const USER_SEARCH_FIELDS: string[] = ['firstName', 'lastName', 'fullName', 'email', 'entity', 'phone'];

/**
 * Population stages for user lookup
 */
export const USER_LOOKUP_STAGES = [
    {
        $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role',
        },
    },
    {
        $unwind: {
            path: '$role',
            preserveNullAndEmptyArrays: true,
        },
    },
];

export const USERS_SEARCH_INDEX = 'users-search';

export const USERS_SEARCH_FIELDS_WITH_MONGO_SEARCH = ['email', 'fullName', 'phone', 'roleName'];

/**
 * Default user filters
 */
export const USER_DEFAULT_FILTERS: UserFilter[] = [
    {
        name: 'Mes suivis',
        table: Table.REQUEST_GLOBAL_MONITORING,
        filter: {
            'status:list': ['Créée', 'En cours'],
            'requestType:list': [],
            'emergencyLevel:list': [],
            'departurePoint:list': [],
            'arrivalPoint:list': [],
            'alert:list': [],
        },
    },
];

/**
 * Empty batch user insert report
 */
export const EMPTY_BATCH_USER_INSERT_REPORT = (): BatchUserInsertReportDto => ({
    alreadyAddedToDatabaseCount: 0,
    failedInsertionCount: 0,
    errorReports: [],
    importDurationInSeconds: 0,
    processedInsertionCount: 0,
    successfulInsertionCount: 0,
});
/**
 * User autocompletion search field
 */
export const USER_AUTOCOMPLETION_SEARCH_FIELD = ['firstName', 'lastName', 'fullName'];
