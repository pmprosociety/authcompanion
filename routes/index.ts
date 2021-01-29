import { Router } from "../deps.ts";
import { signIn } from "../services/signIn.ts";
import { refresh } from "../services/refresh.ts";
import { signUp } from "../services/signUp.ts";
import { updateUser } from "../services/updateUser.ts";
import { forgotPassword } from "../services/forgotPassword.ts";
import { recoverToken } from "../services/recoverytoken.ts";
import { logoutUser } from "../services/logout.ts";

import authorize from "../middlewares/authorize.ts";

//API path
const pathPrefix = "/api/v1/";

const router = new Router({ prefix: pathPrefix });

//auth routes
router
  .post("auth/register", signUp)
  .post("auth/login", signIn)
  .post("auth/refresh", refresh)
  .post("auth/recovery", forgotPassword)
  .post("auth/recovery/token", recoverToken)
  .post("auth/users/me", authorize, updateUser)
  .get("auth/logout", authorize, logoutUser);

export default router;
