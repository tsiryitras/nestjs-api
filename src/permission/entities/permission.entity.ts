import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Enumeration of Permission names
 */
export enum PermissionName {

    VIEW_USER = 'VIEW_USER', // Consultation liste utilisateur
    CREATE_USER = 'CREATE_USER', // Création utilisateur
    EDIT_USER = 'EDIT_USER', // Modification utilisateur
    DELETE_USER = 'DELETE_USER', // Suppression utilisateur

    VIEW_ROLE = 'VIEW_ROLE', // Consultation liste rôle
    CREATE_ROLE = 'CREATE_ROLE', // Création rôle
    EDIT_ROLE = 'EDIT_ROLE', // Modification rôle
    DELETE_ROLE = 'DELETE_ROLE', // Suppression rôle

}

/**
 * Enumeration of Permission category
 */
export enum PermissionCategory {
    USER = 'USER',
    ROLE = 'ROLE',
}

/**
 * Represents a permission
 */
@Schema()
export class Permission {
    /**
     * Id  of permission
     */
    _id: string | Types.ObjectId;

    /**
     * Permission name
     */
    @Prop({ type: String, required: true, trim: true })
    name: PermissionName;

    /**
     * Permission category
     */
    @Prop({ type: String, enum: Object.values(PermissionCategory), required: true })
    category: PermissionCategory;
}

/**
 * Represents Permission Mongoose Document
 */
export type PermissionDocument = HydratedDocument<Permission>;

/**
 * Instance of Permission Mongoose Schema
 */
export const permissionSchema = SchemaFactory.createForClass(Permission);
