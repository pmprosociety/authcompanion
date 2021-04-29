import { Router } from "../deps.ts";
import { login } from "../services/login.ts";
import { refresh } from "../services/refresh.ts";
import { registration } from "../services/registration.ts";
import { userSettings } from "../services/userSettings.ts";
import { accountRecovery } from "../services/accountRecovery.ts";
import { recoverToken } from "../services/recoverytoken.ts";
import { logout } from "../services/logout.ts";

import authorize from "../middlewares/authorize.ts";

//API Path
const pathPrefix = "/api/v1/";

const router = new Router({ prefix: pathPrefix });

//API Server Routes
router
  .post("auth/register", registration)
  .post("auth/login", login)
  .post("auth/refresh", refresh)
  .post("auth/recovery", accountRecovery)
  .post("auth/recovery/token", recoverToken)
  .post("auth/users/me", authorize, userSettings)
  .get("auth/logout", authorize, logout);

export default router;
