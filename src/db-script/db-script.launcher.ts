import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DbScriptService } from './db-script.service';
import { ScriptFn } from './dto/script-fn.interface';

/**
 * DB Script directory
 */
const SCRIPT_DIRECTORY = 'db-script/scripts';

/**
 * Launch every script located inside db-script/scripts folder
 */
export const launchDbScripts = async (dbScriptService: DbScriptService) => {
    const dbScriptFilenames = fs
        // check if db-script exists, otherwiser search inside src/db-script (can be different for local and prod)
        .readdirSync(fs.existsSync('db-script') ? SCRIPT_DIRECTORY : `src/${SCRIPT_DIRECTORY}`)
        .filter((name) => !(name.endsWith('d.ts') || name.endsWith('d.js') || name.endsWith('map')));
    dbScriptFilenames.sort();
    for (const filename of dbScriptFilenames) {
        const filepath = `./scripts/${path.parse(filename).name}`;
        const { scripts } = await import(filepath);
        for (const script of scripts as ScriptFn[]) {
            const dbScript = { filename, script: script.name };
            const alreadyExecuted = await dbScriptService.findOne(dbScript);
            if (!alreadyExecuted) {
                Logger.log(`Executing database script named ${script.name} from file ${filename}`);
                await script(dbScriptService);
                await dbScriptService.create(dbScript);
            }
        }
    }
};
