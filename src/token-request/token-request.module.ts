import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIGURATION_TOKEN_DI } from '../config/configuration-di.constant';
import configuration from '../config/configuration.constant';
import { TokenRequest, tokenRequestSchema } from './entities/token-request.entity';
import { TokenRequestController } from './token-request.controller';
import { TokenRequestRepository } from './token-request.repository';
import { TokenRequestService } from './token-request.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: TokenRequest.name, schema: tokenRequestSchema }])],
    controllers: [TokenRequestController],
    providers: [
        TokenRequestService,
        TokenRequestRepository,
        {
            provide: CONFIGURATION_TOKEN_DI,
            useValue: configuration(),
        },
    ],
    exports: [TokenRequestService],
})
export class TokenRequestModule {}
