// eslint-disable-next-line max-len
import { TOKEN_REQUEST_EXPIRATION_IN_MINUTE as REQUEST_TOKEN_FOR_PASSWORD_EXPIRATION_IN_MINUTE } from "../token-request/token-request.constant";
import { ConfigurationType } from "./configuration.interface";

/**
 * Configuration based on key/value for mongo inside .env
 */
const mongoConf = {
    host: "ndevtest.6epwr.mongodb.net",
    database: "unit-test",
    user: "unit-test-user",
    password: "ooEZouyvWZ2WILUb",
};

export const MAIN_DATABASE_DI_TOKEN = "MAIN_DATABASE";
/**
 * Configuration based on key/value for entire application, got from .env file
 */
const conf: ConfigurationType = {
  app: {
    name: "app-test",
    description: "app test description",
    title: "app title",
    version: "0.0.0",
    environment: "test",
    apiExplorerPath: "api",
  },
  server: {
    host: "",
    port: 0,
  },
  front: {
    frontUrl: "http://localhost",
  },
  jwt: {
    secretKey: "abcdef",
    expiration: 123456,
  },
  mongo: {
    ...mongoConf,
    // MAIN_DATABASE_URI: `mongodb+srv://${mongoConf.user}:${mongoConf.password}@${mongoConf.host}/${mongoConf.database}`,
    MAIN_DATABASE_URI: `mongodb://${mongoConf.user}:${mongoConf.password}@${mongoConf.host}/${mongoConf.database}`,
    MAIN_DATABASE: MAIN_DATABASE_DI_TOKEN,
  },
  proxy: {
    BACKEND_URL: "http://backend",
    BACKEND_SOCKET: "http://backend-socket",
  },
  mail: {
    mailAddress: "something address .com",
  },
  requestToken: {
    requestTokenExpirationForForgottenPassword:
      REQUEST_TOKEN_FOR_PASSWORD_EXPIRATION_IN_MINUTE,
  },
  superAdmin: {
    login: "login",
    password: "pass",
  },
};

export default () => conf;
