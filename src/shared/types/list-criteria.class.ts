import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Represents list criteria used with getPaginated function
 */
export class ListCriteria {
    /**
     * Current page
     */
    @IsInt()
    @Type(() => Number)
    page: number;

    /**
     * Page size
     */
    @IsInt()
    @Type(() => Number)
    pageSize: number;

    /**
     * field where sort will be applied
     */
    @IsString()
    @IsOptional()
    sortBy: string | undefined;

    /**
     * Direction of the sort
     * -1: Descendant
     * 1: Ascendant
     */
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    sortOrder: 1 | -1 | undefined;

    /**
     * Search term
     */
    @IsString()
    @IsOptional()
    search: string;
}
