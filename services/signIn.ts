import { Status } from "../deps.ts";
import { compare } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";
import {SECURE} from "../config.ts";

export const signIn = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request, No Request Body");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      ctx.throw(Status.BadRequest, "Bad Request, Incorrect Body Type");
    }

    // validate request body against a schmea
    const loginSchema = superstruct.object({
      email: superstruct.string(),
      password: superstruct.string(),
    });

    superstruct.assert(bodyValue, loginSchema);

    const { email, password } = bodyValue;
    const result = await db.queryObject(
      "SELECT * FROM users WHERE email = $1;",
      email,
    );

    if (result.rowCount == 0) {
      ctx.throw(Status.Forbidden, "Bad Request, Please Retry Login");
      await db.release();
    }

    const user = result.rows[0];

    if (!user.active) {
      ctx.throw(
        Status.Forbidden,
        "Bad Request, Please Retry Login",
      );
      await db.release();
    }
    // @ts-ignore
    if (await compare(password, user.password)) {
      const accessToken = await makeAccesstoken(result);
      const refreshToken = await makeRefreshtoken(result);
      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)) // TODO: Make configurable now, set to 7 days

      ctx.response.status = Status.OK;

      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: date,
        secure: SECURE?.toLowerCase() !== 'false',
        sameSite: 'none',
      });

      ctx.response.body = {
        data: {
          id: user.UUID,
          type: "Login",
          attributes: {
            name: user.name,
            email: user.email,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
      await db.release();
    } else {
      ctx.throw(
        Status.BadRequest,
        "Username or Password is Invalid, Please Retry Login",
      );
      await db.release();
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
