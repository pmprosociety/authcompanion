import { Status } from "../deps.ts";
import { verify } from "../deps.ts";
import { config } from "../deps.ts";

const env = config();

export default async (ctx: any, next: any) => {
  const authHeader = ctx.request.headers.get("authorization");

  if (!authHeader) {
    ctx.throw(Status.Unauthorized, "Unauthorized");
  }
  try {
    const jwt = authHeader.split(" ")[1];
    const key = env.ACCESSTOKENKEY;

    const payloadToken = await verify(jwt, key, "HS256");
    if (payloadToken.isValid) {
      await next();
    } else {
      ctx.throw(Status.Unauthorized, "Token Invalid, Please Login");
    }
  } catch (err) {
    const status = err.status;

    console.log(err);
    ctx.throw(status, err.message);
  }
};
