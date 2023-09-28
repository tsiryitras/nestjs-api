import { PartialType } from '@nestjs/swagger';
import { CreateTokenRequestDto } from './create-token-request.dto';

/**
 * Dto used for TokenRequest update
 * UpdateTokenRequestDto is a partial of TokenRequest
 */
export class UpdateTokenRequestDto extends PartialType(CreateTokenRequestDto) {}
