import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { CONFIGURATION_TOKEN_DI } from "../config/configuration-di.constant";
import configuration from "../config/configuration.constant";
import { RoleModule } from "../role/role.module";
import { TokenRequestModule } from "../token-request/token-request.module";
import { User, userSchema } from "./entities/user.entity";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
        TokenRequestModule,
        forwardRef(() => AuthModule),
        RoleModule,
    ],

    controllers: [UserController],
    providers: [
        UserService,
        UserRepository,
        {
            provide: CONFIGURATION_TOKEN_DI,
            useValue: configuration(),
        },
        {
            provide: "authService",
            useClass: AuthService,
        },
    ],
    exports: [UserService],
})
export class UserModule {}
