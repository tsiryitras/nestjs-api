import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbScriptRepository } from './db-script.repository';
import { DbScriptService } from './db-script.service';
import { DbScript, DbScriptSchema } from './entities/db-script.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: DbScript.name,
                schema: DbScriptSchema,
            },
        ]),
    ],
    providers: [DbScriptService, DbScriptRepository],
    exports: [DbScriptService],
})
export class DbScriptModule {}
