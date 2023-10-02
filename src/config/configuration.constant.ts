import * as dotenv from "dotenv";
import * as env from "env-var";
// eslint-disable-next-line max-len
import { TOKEN_REQUEST_EXPIRATION_IN_MINUTE as REQUEST_TOKEN_FOR_PASSWORD_EXPIRATION_IN_MINUTE } from "../token-request/token-request.constant";

dotenv.config({ path: ".env" });

/**
 * Configuration based on key/value for mongo inside .env
 */

const mongoConf = {
  host: env.get("MONGO_HOST").required().asString(),
  database: env.get("MONGO_DATABASE").required().asString(),
  user: env.get("MONGO_USER").required().asString(),
  password: env.get("MONGO_PASSWORD").required().asString(),
};

export const MAIN_DATABASE_DI_TOKEN = "MAIN_DATABASE";
/**
 * Configuration based on key/value for entire application, got from .env file
 */
const conf = {
  app: {
    name: env.get("APP_NAME").required().asString(),
    description: env.get("APP_DESCRIPTION").required().asString(),
    title: env.get("APP_TITLE").required().asString(),
    version: env.get("APP_VERSION").required().asString(),
    environment: env.get("APP_ENVIRONMENT").required().asString(),
    apiExplorerPath: env.get("APP_API_EXPLORER_PATH").required().asString(),
  },
  server: {
    host: env.get("SERVER_HOST").required().asString(),
    port: env.get("SERVER_PORT").required().asPortNumber(),
  },
  front: {
    frontUrl: env.get("FRONT_URL").required().asString(),
  },
  jwt: {
    secretKey: env.get("JWT_SECRET_KEY").required().asString(),
    expiration: env.get("JWT_EXPIRATION").required().asIntPositive(),
  },
  superAdmin: {
    login: env.get("SUPER_ADMIN_LOGIN").required().asString(),
    password: env.get("SUPER_ADMIN_PASSWORD").required().asString(),
  },
  mongo: {
    ...mongoConf,
    // MAIN_DATABASE_URI: `mongodb+srv://${mongoConf.user}:${mongoConf.password}@${mongoConf.host}/${mongoConf.database}`,
    MAIN_DATABASE_URI: `mongodb://${mongoConf.host}/${mongoConf.database}`,
    MAIN_DATABASE: MAIN_DATABASE_DI_TOKEN,
  },
  proxy: {
    BACKEND_URL: env.get("BACKEND_URL").required().asString(),
    BACKEND_SOCKET: env.get("BACKEND_SOCKET_URL").required().asString(),
  },
  mail: {
    mailAddress: env.get("MAIL_ADDRESS").required().asString(),
  },
  requestToken: {
    requestTokenExpirationForForgottenPassword:
      REQUEST_TOKEN_FOR_PASSWORD_EXPIRATION_IN_MINUTE,
  },
};

export default () => conf;
