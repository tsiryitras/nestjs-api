import { Module } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CONFIGURATION_TOKEN_DI } from "./config/configuration-di.constant";
import configuration from "./config/configuration.constant";
import { RequirePermissionsGuard } from "./core/guards/require-permissions.guard";
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
        AppService,
        {
            provide: CONFIGURATION_TOKEN_DI,
            useValue: configuration(),
        },
        {
            provide: APP_GUARD,
            useClass: RequirePermissionsGuard,
        },
        Reflector,
        JwtService,
    ],
})
export class AppModule {}
