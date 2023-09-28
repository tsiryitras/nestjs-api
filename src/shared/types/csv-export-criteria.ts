import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Represents list criteria used with CSV export function
 */
export class CsvExportCriteria {
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

    /**
     * list of selected fields
     */
    @IsArray()
    @IsOptional()
    columns: string[] | undefined;
}
