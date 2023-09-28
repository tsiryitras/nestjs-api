import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Type of DbSCript Document
 */
export type DbScriptDocument = HydratedDocument<DbScript>;

/**
 * Class that represent a script executed during migration
 */
@Schema()
export class DbScript {
    /**
     * file name of the script
     */
    @Prop({ type: String, required: true, trim: true })
    filename: string;

    /**
     * Name of the function inside script file
     */
    @Prop({ type: String, required: true, trim: true })
    script: string;

    /**
     * script execution date
     */
    @Prop({ type: Date, required: true, default: new Date() })
    executedAt?: Date;
}

/**
 * Instance of db script schema
 */
export const DbScriptSchema = SchemaFactory.createForClass(DbScript);
