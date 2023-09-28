import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Role } from "../../role/entities/role.entity";

/**
 * Enumeration of Tables
 */
export enum Table {
  REQUEST_GLOBAL_MONITORING = "REQUEST_GLOBAL_MONITORING",
  POINT_MONITORING = "POINT_MONITORING",
  USERS = "USERS",
  ROLES = "ROLES",
  DRIVER_MONITORING = "DRIVER_MONITORING",
  DOCUMENT = "DOCUMENT",
  MS_STOCK_STATE = "MS_STOCK_STATE",
  MS_STOCK_HISTORY = "MS_STOCK_HISTORY",
  PACKING_STOCK_STATE = "PACKING_STOCK_STATE",
  PACKING_STOCK_HISTORY = "PACKING_STOCK_HISTORY",
  ROLLS_MONITORING = "ROLLS_MONITORING",
}

/**
 * Represents a filter
 */
export interface Filter {
  // Represents variable fields that can be string / number / Date / string [] / boolean
  [key: string]: string | number | Date | Array<string | boolean>;
}

/**
 * Represents an user filter
 */
@Schema()
export class UserFilter {
  /**
   * Id  of user filter
   */
  _id?: string;

  /**
   * Name  of user filter
   */
  @Prop({ type: String, required: true })
  name: string;

  /**
   * Table name
   */
  @Prop({ type: String, enum: Object.values(Table), required: true })
  table: Table;

  /**
   * Stored filter
   */
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  filter: Filter;
}

/**
 * Instance of user filter schema
 */
const userFilterSchema = SchemaFactory.createForClass(UserFilter);

/**
 * Represents a User
 */
@Schema()
export class User {
  /**
   * Id  of user
   */
  _id: string | Types.ObjectId;

  /**
   * User first name
   */
  @Prop({ type: String, trim: true, required: true })
  firstName: string;

  /**
   * User last name
   */
  @Prop({ type: String, trim: true, required: true })
  lastName: string;

  /**
   * User full name, a concatenation of firstName and lastName
   */
  @Prop({ type: String, trim: true, required: true })
  fullName: string;

  /**
   * Username used for login
   */
  @Prop({ type: String, trim: true, required: true })
  userName: string; // ça peut être le matricule

  /**
   * Encrypted password
   */
  @Prop({ type: String, trim: true })
  password?: string;

  /**
   * User email
   */
  @Prop({ type: String, trim: true, required: true })
  email: string;

  /**
   * User phone number
   */
  @Prop({ type: String, required: false })
  phone: string;

  /**
   * User role
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Role" })
  role: string | Role;

  /**
   * User role name
   * Need to save roleName directly on user collection for  Atlas Search
   */
  @Prop({ type: String, required: false })
  roleName?: string | Role;

  /**
   * User creation Date
   */
  @Prop({ type: Date, required: true })
  creationDate: Date;

  /**
   * User last connection date
   */
  @Prop({ type: Date, required: false })
  lastConnectionDate: Date | null;

  /**
   * User filters
   */
  @Prop({ type: [userFilterSchema] })
  filters: UserFilter[];

  /**
   * Failed connection count
   */
  @Prop({ type: Number, required: false })
  failedConnectionCount?: number;

  /**
   * Determine if account is active
   */
  @Prop({ type: Boolean, default: true, required: true })
  isActive: boolean;
}

/**
 * Represents User Mongoose Document
 */
export type UserDocument = HydratedDocument<User>;

/**
 * Instance of User Mongoose Schema
 */
export const userSchema = SchemaFactory.createForClass(User);

/**
 * Encrypt password on user creation
 */
userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.fullName = `${this.lastName} ${this.firstName}`;

  next();
});
