// @ts-nocheck
import { Status } from "../deps.ts";
import {
  makeAccesstoken,
  makeRefreshtoken,
  validateJWT,
} from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";

export const recoverToken = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      log.debug("Request has no body");
      ctx.throw(Status.BadRequest, "Bad Request, Please Try Again");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      log.debug("Request body is not JSON");
      ctx.throw(Status.BadRequest, "Bad Request, Please Try Again");
    }

    // validate request body against a schmea
    const recoverytokenSchema = superstruct.object({
      token: superstruct.string(),
    });

    superstruct.assert(bodyValue, recoverytokenSchema);

    const { token } = bodyValue;

    //if the request has a valid recovery token, issue new access token
    let validatedtoken = await validateJWT(token);

    const userObj = await db.queryObject({
      text:
        `SELECT name, email, password, "UUID", active, refresh_token, created_at, updated_at FROM users WHERE email = $1;`,
      args: [validatedtoken.payload.email],
      fields: [
        "name",
        "email",
        "password",
        "UUID",
        "active",
        "refresh_token",
        "created_at",
        "updated_at",
      ],
    });

    const user = userObj.rows[0];

    const accessToken = await makeAccesstoken(userObj);
    const refreshToken = await makeRefreshtoken(userObj);

    ctx.response.status = Status.OK;
    ctx.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      expires: new Date("2022-01-01T00:00:00+00:00"),
    });
    ctx.response.body = {
      data: {
        id: validatedtoken.payload.id,
        type: "Recovery Login",
        attributes: {
          name: user.name,
          email: user.email,
          access_token: accessToken.token,
          access_token_expiry: accessToken.expiration,
        },
      },
    };
    await db.release();
  } catch (err) {
    log.error(err);
    ctx.response.status = err.status | 400;
    ctx.response.type = "json";
    ctx.response.body = {
      errors: [{
        title: "Server Error",
        detail: err.message,
      }],
    };
  } finally {
  }
};
