import { Router } from "../deps.ts";
import { login } from "../services/login.ts";
import { refresh } from "../services/refresh.ts";
import { register } from "../services/register.ts";
import { updateUser } from "../services/update.ts";
import { recoverUser } from "../services/recovery.ts";
import { recoverToken } from "../services/recoveryToken.ts";

import authorize from "../middlewares/authorize.ts";

//API path
const pathPrefix = "/api/v1/";

const router = new Router({ prefix: pathPrefix });

//auth routes
router
  .post("auth/register", register)
  .post("auth/login", login)
  .post("auth/refresh", refresh)
  .post("auth/users/me", authorize, updateUser)
  .post("auth/recovery", recoverUser)
  .post("auth/recovery/token", recoverToken);

export default router;
