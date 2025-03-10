import "reflect-metadata";

import { IsEmail, IsTimeZone, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";

class Env {
  @IsEmail()
  NODE_ENV: string | undefined;

  @IsTimeZone()
  TZ: string | undefined;
}

const env = {
  NODE_ENV: "test",
  TZ: "Asia/Tokyo",
};

const envInstance = plainToInstance(Env, env);

validateSync(envInstance);
