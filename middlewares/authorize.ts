import { Status } from "../deps.ts";
import { validateJWT } from "../helpers/jwtutils.ts";

export default async (ctx: any, next: any) => {
  try {
    const authHeader = ctx.request.headers.get("authorization");
    const userJWT = authHeader.split(" ")[1];

    if (!authHeader) {
      ctx.throw(Status.Unauthorized, "Unauthorized");
    }

    if (!userJWT) {
      ctx.throw(Status.Unauthorized, "Unauthorized");
    }

    let { payload } = await validateJWT(userJWT);
    ctx.state.authenticated = true;
    ctx.state.JWTclaims = payload;

    await next();
  } catch (err) {
    console.log(err);
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
