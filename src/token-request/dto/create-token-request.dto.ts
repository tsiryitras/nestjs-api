import { OmitType } from '@nestjs/swagger';
import { TokenRequest } from '../entities/token-request.entity';

/**
 * Dto used for TokenRequest creation
 * Same as TokenRequest but omit _id
 */
export class CreateTokenRequestDto extends OmitType(TokenRequest, ['_id']) {}
