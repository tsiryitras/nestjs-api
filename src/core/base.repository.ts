import { Document, Model, PipelineStage, Query } from 'mongoose';
import { CsvExportCriteria } from '../shared/types/csv-export-criteria';
import { Filter } from '../shared/types/filter.interface';
import { ListCriteria } from '../shared/types/list-criteria.class';
import { Paginated } from '../shared/types/page.interface';
import { parseQueryParams } from '../shared/utils/query-parser.utils';
import {
    buildAutocompleteSearchStage,
    buildSearchStage,
    formatSearchAutocompleteResult,
} from './base-respository-mongo-search.constant';
import { parseFilter, parsedFilterToMongoQueryOperator } from './base-respository-mongo.constant';

/**
 * Generic class for Repositories
 * @param T: Type of entity, should extends Document
 */
export abstract class BaseRepository<T extends Document, U> {
    /**
     * accessible instance of the model
     */
    readonly model: Model<T>;

    /**
     * Constructor of BaseRepository class
     * @param schemaModel injected model
     */
    constructor(schemaModel: Model<T>) {
        this.model = schemaModel;
    }

    /**
     * find documents according to search criteria
     * @param conditions criteria of search
     * @returns list of T
     */
    find(conditions: object): Query<T[], T> {
        return this.model.find(conditions);
    }

    /**
     * count documents that match search criteria
     * @param conditions criteria of search
     * @returns count corresponding to documents that match criteria
     */
    count(conditions: object): Promise<number> {
        return this.model.count(conditions).exec();
    }

    /**
     * return a document according to id
     * If the document does not exist, return undefined
     * @param id id of the document
     * @returns the document corresponding to the id inside database
     */
    findById(id: string): Query<T | null, T> {
        return this.model.findById(id);
    }

    /**
     * Return the first document found in database that match the search criteria
     * @param conditions search criteria
     * @returns first document that match criteria
     */
    findOne(conditions: object): Query<T | null, T> {
        return this.model.findOne(conditions, undefined);
    }

    /**
     * find and update according to search criteria
     * @param conditions search criteria
     * @param update an object that represents partial of the entity
     * @returns number of total updates
     */
    findAndUpdate(conditions: object, update: Partial<U>) {
        return this.model.findOneAndUpdate(conditions, update);
    }

    /**
     * Create document inside database
     * @param item document to be created, the document should not contain _id field
     * @returns created Document
     */
    create(item: Omit<U, '_id'>): Promise<U> {
        return this.model.create(item) as unknown as Promise<U>;
    }

    /**
     * Delete document with specified id
     * @param id id of document to be deleted
     * @returns number of total delete
     */
    delete(id: string): Promise<boolean> {
        return this.model.deleteOne({ _id: id }).then(() => true);
    }

    /**
     * Delete documents
     * @param id id of document to be deleted
     * @returns number of total delete
     */
    deleteMany(filter: object): Promise<boolean> {
        return this.model.deleteMany(filter).then(() => true);
    }

    /**
     * Update the document with the specified id
     * @param id id of the document
     * @param item partial of document which represents the update
     * @returns updated document if the document is found
     */
    update(id: string, item: Partial<U>): Promise<U | null> {
        return this.model.findByIdAndUpdate(id, item, { new: true });
    }

    /**
     * Get paginated entity based on criteria, search fields, custom lookup stages, additional criteria
     * @param criteria List criteria
     * @param searchFields Search fields
     * @param lookupStages Custom lookup stages
     * @param additionnalCriteria Additional criteria
     * @returns Paginated entity
     */
    // eslint-disable-next-line max-lines-per-function
    getByListCriteria(
        criteria: ListCriteria,
        searchFields: string[],
        lookupStages: PipelineStage[] = [],
        additionnalCriteria = {}
    ): Promise<Paginated<U>> {
        const { page, pageSize, search, sortBy, sortOrder, ...filter } = parseQueryParams(criteria);
        return this.model
            .aggregate([
                // Do lookup if there is any:
                ...lookupStages,
                // Manage filters and search:
                {
                    $match: {
                        ...this.buildFilterRelatedCriteria(filter), // Filters
                        ...this.buildSearchRelatedCriteria(search, searchFields), // Search
                        ...additionnalCriteria,
                    },
                },
                // Manage sorting:
                ...(sortBy && sortOrder ? [{ $sort: { [sortBy]: sortOrder } }] : []),
                {
                    $facet: {
                        // Manage pagination:
                        items: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
                        // Count total items:
                        totalItems: [{ $count: 'totalItems' }],
                    },
                },
            ])
            .then(([{ items, totalItems }]) => ({ items, totalItems: totalItems[0]?.totalItems || 0 }));
    }

    /**
     * Get csv export data: array of entity based on criteria, search fields, custom lookup stages, additional criteria, selected columns
     * @param criteria ListCsvCriteria
     * @param searchFields Search fields
     * @param lookupStages Custom lookup stages
     * @param additionnalCriteria Additional criteria
     * @returns array of entity
     */
    // eslint-disable-next-line max-lines-per-function
    getCsvExportData(
        criteria: CsvExportCriteria,
        searchFields: string[],
        lookupStages: PipelineStage[] = [],
        additionnalCriteria = {}
    ): Promise<Partial<U>[]> {
        const { search, sortBy, sortOrder, columns, ...filter } = parseQueryParams(criteria);
        return this.model
            .aggregate([
                // Do lookup if there is any:
                ...lookupStages,
                // Manage filters and search:
                {
                    $match: {
                        ...this.buildFilterRelatedCriteria(filter), // Filters
                        ...this.buildSearchRelatedCriteria(search, searchFields), // Search
                        ...additionnalCriteria,
                    },
                },
                // Manage sorting:
                ...(sortBy && sortOrder ? [{ $sort: { [sortBy]: sortOrder } }] : []),
                // Manage column selecting :
                {
                    $project: this.buildFieldSelectionProjectObject(columns),
                },
            ])
            .exec();
    }

    /**
     * Get List of documnets with Atlas Search
     * @param searchIndex atlas search index
     * @param criteria list criteria
     * @param additionnalCriteria additional criteria
     * @returns Paginated document
     */
    // eslint-disable-next-line max-lines-per-function
    getList(
        searchIndex: string,
        criteria: ListCriteria,
        searchFields: string[],
        additionnalCriteria = {}
    ): Promise<Paginated<U>> {
        const { page, pageSize, search, sortBy, sortOrder, ...filter } = parseQueryParams(criteria);
        let searchStage = [];
        // If no search query and no filter
        if (!search && Object.keys(filter).length === 0) {
            searchStage = [...(sortBy && sortOrder ? [{ $sort: { [sortBy]: sortOrder } }] : [])];
        } else {
            searchStage = [
                {
                    $search: buildSearchStage(searchIndex, criteria, searchFields),
                },
            ];
        }

        const stages = [
            // Manage filters, search and sort with atlas search
            ...searchStage,
            // Manage additional Criteria
            {
                $match: {
                    ...additionnalCriteria,
                },
            },
            {
                $facet: {
                    // Manage pagination:
                    items: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
                    // Count total items:
                    totalItems: [{ $count: 'totalItems' }],
                },
            },
        ];
        return this.model
            .aggregate(stages)
            .then(([{ items, totalItems }]) => ({ items, totalItems: totalItems[0]?.totalItems || 0 }));
    }

    /**
     * Get a list of autocomplete suggestions with Atlas search
     * @param index Atlas search index
     * @param query search term
     * @param searchFields List of mongodb fields with that can perform autocomplete in index definition
     * @returns List of text suggestions
     */
    getAutocompleteSuggestions(index: string, query: string, searchFields: string[]): Promise<string[]> {
        const stages = [
            {
                $search: buildAutocompleteSearchStage(index, query, searchFields),
            },
            {
                $project: {
                    highlights: {
                        $meta: 'searchHighlights',
                    },
                },
            },
        ];
        return this.model.aggregate(stages).then((results) => formatSearchAutocompleteResult(results));
    }

    /**
     * Build Search criteria based on search teram and search fields
     * @param search search term
     * @param searchFields search fields
     * @returns Criteria based on search term and search fields
     */
    buildSearchRelatedCriteria(search: string | undefined, searchFields: string[]): Object {
        return search
            ? {
                  $or: searchFields.map((field) => ({
                      [field]: { $regex: `${search}`, $options: 'i' },
                  })),
              }
            : {};
    }

    /**
     * Build filter criteria according to filter
     * @param filter Filter
     * @returns Object representing filter related criteria
     */
    private buildFilterRelatedCriteria(filter: Filter | undefined): object {
        const parsedFilter = parseFilter(filter);
        const filterCriteria = Object.fromEntries(
            Object.entries(parsedFilter).map(([key, value]) => [key, parsedFilterToMongoQueryOperator(value)])
        );
        return filterCriteria;
    }

    /**
     * Build object to pass to project aggregate
     * @param columns string[]
     * @returns Object set to project representing the columns to select
     */
    private buildFieldSelectionProjectObject(columns: string[]): object {
        const projectObj = columns.reduce((projectObject, field) => {
            projectObject[field] = 1;
            return projectObject;
        }, {});
        return projectObj;
    }
}
