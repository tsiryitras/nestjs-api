import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { CONFIGURATION_TOKEN_DI } from "./config/configuration-di.constant";
import configuration from "./config/configuration.constant";
import { DbScriptModule } from "./db-script/db-script.module";

import { PermissionModule } from "./permission/permission.module";
import { RoleModule } from "./role/role.module";
import { TokenRequestModule } from "./token-request/token-request.module";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        MongooseModule.forRoot(configuration().mongo.MAIN_DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }),
        AuthModule,
        UserModule,
        DbScriptModule,
        PermissionModule,
        RoleModule,
        TokenRequestModule,
    ],
    controllers: [],
    providers: [
        {
            provide: CONFIGURATION_TOKEN_DI,
            useValue: configuration(),
        },
        Reflector,
        JwtService,
    ],
})
export class MigrationModule {}
