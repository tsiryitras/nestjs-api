/**
 * Generic interface that specify Generic Response
 * All data returned from server should be wrap by GenericResponse, and the data itself is inside data field
 */
export class GenericResponse<T> {
    /**
     * Data  of generic response
     */
    data: T;
}
