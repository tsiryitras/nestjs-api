import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../core/base.repository';
import { TokenRequest, TokenRequestDocument } from './entities/token-request.entity';

/**
 * Repository for TokenRequest layer
 * Extends BaseRepository
 */
export class TokenRequestRepository extends BaseRepository<TokenRequestDocument, TokenRequest> {
    /**
     * Constructor for TokenRequestRepository
     * @param model Injected TokenRequest model
     */
    constructor(@InjectModel(TokenRequest.name) model) {
        super(model);
    }
}
