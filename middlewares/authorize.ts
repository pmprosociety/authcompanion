import { Status } from "../deps.ts";
import { validateJWT } from "../helpers/jwtutils.ts";
import log from "../helpers/log.ts";

export default async (ctx: any, next: any) => {
  try {
    const authHeader = ctx.request.headers.get("authorization");

    if (!authHeader) {
      log.debug("Missing Authentication header");
      ctx.throw(Status.Unauthorized, "Unauthorized");
    }

    const userJWT = authHeader.split(" ")[1];

    if (!userJWT) {
      log.debug("Missing valid JWT in Authentication header");
      ctx.throw(Status.Unauthorized, "Unauthorized");
    }

    let { payload } = await validateJWT(userJWT);
    ctx.state.JWTclaims = payload;

    await next();
  } catch (err) {
    ctx.response.status = err.status | 400;
    ctx.response.type = "json";
    ctx.response.body = {
      errors: [{
        title: "Server Error",
        detail: err.message,
      }],
    };
  }
};
