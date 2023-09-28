import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';

/**
 * Enumeration of TokenRequest Status
 */
export enum TokenRequestStatus {
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
    USED = 'USED',
}

/**
 * Enumeration of TokenRequest type
 */
export enum TokenRequestType {
    ACCOUNT_CREATION = 'ACCOUNT_CREATION',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

/**
 * Represents a Token Request
 * It consists of a token that can only be used once and has an expiration date
 */
@Schema()
export class TokenRequest {
    /**
     * Id  of token request
     */
    _id: string | Types.ObjectId;

    /**
     * The token
     */
    @Prop({ type: String, trim: true, required: true })
    token: string;

    /**
     * ToquenRequest request date
     */
    @Prop({ type: Date, required: true })
    requestDate: Date;

    /**
     * TokenRequest expiration date
     */
    @Prop({ type: Date, required: true })
    expirationDate: Date;

    /**
     * TokenRequest usage date
     */
    @Prop({ type: Date, required: false })
    usageDate?: Date;

    /**
     * The user who Use the token
     * user is string by default
     * user is User if populated
     */
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: string | User;

    /**
     * User mail
     * Denormalized email to accelerate search or filter
     */
    @Prop({ type: String, trim: true, required: true })
    userMail: string;

    /**
     * Token Request status
     */
    @Prop({ type: String, enum: Object.values(TokenRequestStatus), required: true })
    status: TokenRequestStatus;

    /**
     * TokenRequest type
     */
    @Prop({ type: String, enum: Object.values(TokenRequestType), required: true })
    type: TokenRequestType;
}

/**
 * Represents Token Request Mongoose Document
 */
export type TokenRequestDocument = HydratedDocument<TokenRequest>;

/**
 * Instance of Token Request Schema
 */
export const tokenRequestSchema = SchemaFactory.createForClass(TokenRequest);
