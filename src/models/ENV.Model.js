import dotenv from "dotenv";
dotenv.config();
const _env = process.env;
export const ENV = {
  NODE_ENV: _env.NODE_ENV,
  HOST: _env.HOST,
  PORT: +_env.PORT,
  USESSL: _env.USESSL === "true",
  AUTH_PATH: _env.AUTH_PATH,
  PROJECTS_PATH: _env.PROJECTS_PATH,
  PUBLISH_PATH: _env.PUBLISH_PATH,
  TRANSP_PATH: _env.TRANSP_PATH,
  DIR_APPS_PATH: _env.DIR_APPS_PATH,
  DIR_SOURCE_PATH: _env.DIR_SOURCE_PATH,
  DIR_TEMP_APPS_PATH: _env.DIR_TEMP_APPS_PATH,
  TOKEN_SECRET: _env.TOKEN_SECRET,
  TOKEN_LIFE: +_env.TOKEN_LIFE,

  REDIS_HOST: _env.REDIS_HOST,
  REDIS_PORT: +_env.REDIS_PORT,
  REDIS_PASSWORD: _env.REDIS_PASSWORD,
  REDIS_DATABASE: _env.REDIS_DATABASE,
};
