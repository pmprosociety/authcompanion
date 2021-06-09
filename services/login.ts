import { Status } from "../deps.ts";
import { compare } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";
import config from "../config.ts";
import { sendHook } from "./webhook.ts";

export const login = async (ctx: any) => {
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

    const userObj = await db.queryObject({
      text:
        `SELECT name, email, password, "uuid", active, refresh_token, created_at, updated_at FROM users WHERE email = $1;`,
      args: [email],
      fields: [
        "name",
        "email",
        "password",
        "uuid",
        "active",
        "refresh_token",
        "created_at",
        "updated_at",
      ],
    });

    if (userObj.rowCount == 0) {
      ctx.throw(
        Status.Forbidden,
        "Username or Password is Invalid, Please Retry Login",
      );
      await db.release();
    }

    const user = userObj.rows[0];

    if (!user.active) {
      ctx.throw(
        Status.Forbidden,
        "Username or Password is Invalid, Please Retry Login",
      );
      await db.release();
    }
    if (await compare(password, <string> user.password)) {
      const accessToken = await makeAccesstoken(userObj);
      const refreshToken = await makeRefreshtoken(userObj);
      const date = new Date();
      date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // TODO: Make configurable now, set to 7 days

      ctx.response.status = Status.OK;
      ctx.response.headers.set(
        "x-authc-client-origin",
        `${config.CLIENTORIGIN}`,
      );

      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: date,
        secure: config.SECURE?.toLowerCase() !== "false",
        sameSite: "none",
      });

      const userAttributes = {
        name: user.name,
        email: user.email,
        created: user.created_at,
        updated: user.updated_at,
        access_token: accessToken.token,
        access_token_expiry: accessToken.expiration,
      };

      ctx.response.body = {
        data: {
          id: user.uuid,
          type: "Login",
          attributes: userAttributes,
        },
      };
      sendHook({
        name: "post-login",
        data: { id: user.uuid, ...userAttributes },
      });
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
  }
};
