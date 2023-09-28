import { DbScriptService } from '../db-script.service';

/**
 * ScriptFn Type definition
 * The ScriptFn is a function that take DbScriptService as a parameter and return a Promise of void
 */
export type ScriptFn = (dbScriptService: DbScriptService) => Promise<void>;
