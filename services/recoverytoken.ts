import { Status } from "../deps.ts";
import { validate } from "../deps.ts";
import {
  makeAccesstoken,
  makeRecoverytoken,
  makeRefreshtoken,
  validateJWT,
} from "../helpers/jwtutils.ts";
import { recoverytokenSchema } from "./schemas.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

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

    const [passes, errors] = await validate(bodyValue, recoverytokenSchema);

    if (!passes) {
      log.debug("Request did not pass body validation");
      ctx.throw(Status.BadRequest, errors);
    }

    const { token } = bodyValue;

    //if the request has a valid recovery token, issue new access token
    if (token) {
      let validatedtoken = await validateJWT(token);

      const userObj = await db.query(
        "SELECT * FROM users WHERE email = $1;",
        validatedtoken.payload.email,
      );

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
            name: validatedtoken.payload.name,
            email: validatedtoken.payload.email,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
    }
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
