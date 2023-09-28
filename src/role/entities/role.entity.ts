import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Permission, permissionSchema } from '../../permission/entities/permission.entity';

/**
 * Enumeration of Role type
 */
export enum RoleType {
    SUPER_ADMIN = 'SUPER_ADMIN',
    NEW_USER_DEFAULT_ROLE = 'NEW_USER_DEFAULT_ROLE',
    CREATED_ROLE = 'CREATED_ROLE',
}

/**
 * Represents a role
 */
@Schema()
export class Role {
    /**
     * Id  of role
     */
    _id: string | Types.ObjectId;

    /**
     * Role name
     */
    @Prop({ type: String, required: true, trim: true })
    name: string;

    /**
     * Role description
     */
    @Prop({ type: String, required: true, trim: true })
    description: string;

    /**
     * List of permissions affected to Role
     */
    @Prop({ type: [permissionSchema] })
    permissions: Permission[];

    /**
     * Role type
     */
    @Prop({ type: String, required: true, enum: Object.values(RoleType), default: RoleType.CREATED_ROLE })
    type?: RoleType;

    /**
     * Count of permissions for the Role
     */
    @Prop({ type: Number, required: true })
    nbPermissions: number;

    /**
     * Count of users having the Role
     */
    @Prop({ type: Number, required: true })
    nbUsers: number;
}

/**
 * Represents Role Mongoose Document
 */
export type RoleDocument = HydratedDocument<Role>;

/**
 * Instance of Role Mongoose Schema
 */
export const roleSchema = SchemaFactory.createForClass(Role);
