export enum BatchInsertErrorReportType {
  ALREADY_INSERTED = "ALREADY_INSERTED",
  ERROR = "ERROR",
}

/**
 * Represents a line of error
 * - number of the line where the error is
 * - label
 * - rawError
 */
export interface BatchInsertErrorReport {
  /**
   * Line number where the error is
   */
  lineNumber: number;

  /**
   * Error label that will be displayed to the front
   */
  errorLabel: string;

  /**
   * Raw error for debugging
   */
  rawError: string;

  /**
   * type of the error
   */
  type: BatchInsertErrorReportType;
}

/**
 * Represents a report after batch user insert
 * Contains informations about:
 * - number of processed lines
 * - number of inserted lines
 * - number of ignored lines (error)
 * - number of already inserted lines
 * - list of lines that contains error
 * - list of lines that are already inserted
 * - import duration
 */
export class BatchUserInsertReportDto {
  /**
   * Proccessed document count
   */
  processedInsertionCount: number;

  /**
   * successful insertion count
   */
  successfulInsertionCount: number;

  /**
   * error insertion count
   */
  failedInsertionCount: number;

  /**
   * already added to database count
   */
  alreadyAddedToDatabaseCount: number;

  /**
   * Import duration in seconds
   */
  importDurationInSeconds: number;

  /**
   * array of error reports
   */
  errorReports: BatchInsertErrorReport[];
}
