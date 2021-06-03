import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { v4 } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";
import { superstruct } from "../deps.ts";
import { sendHook } from "./webhook.ts";

export const userProfile = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      log.debug("Request has no body");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      log.debug("Request is not JSON");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    // validate request body against a schmea
    const updateSchema = superstruct.object({
      name: superstruct.string(),
      email: superstruct.string(),
      password: superstruct.optional(superstruct.string()),
    });

    superstruct.assert(bodyValue, updateSchema);

    const { name, email, password } = bodyValue;

    const userObj = await db.queryObject({
      text: 'SELECT email FROM users WHERE "uuid" = $1;',
      args: [ctx.state.JWTclaims.id],
      fields: ["uuid"],
    });

    if (userObj.rowCount == 0) {
      log.warning("Unable to find user to update");
      await db.release();
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
    }

    if (password) {
      const hashpassword = await hash(password);
      const jtiClaim = v4.generate();

      const userObj1 = await db.queryObject({
        text:
          `Update "users" SET name = $1, email = $2, password = $3, refresh_token = $4 WHERE "uuid" = $5 RETURNING name, email, "uuid", created_at, updated_at;`,
        args: [name, email, hashpassword, jtiClaim, ctx.state.JWTclaims.id],
        fields: ["name", "email", "uuid", "created_at", "updated_at"],
      });

      const user = userObj1.rows[0];

      const accessToken = await makeAccesstoken(userObj1);
      const refreshToken = await makeRefreshtoken(userObj1);

      ctx.response.status = Status.OK;
      ctx.response.headers.set(
        "x-authc-client-origin",
        `${config.CLIENTORIGIN}`,
      );
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
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
          type: "Updated User",
          attributes: userAttributes,
        },
      };
      sendHook({
        name: "post-profile-update",
        data: { id: user.uuid, ...userAttributes },
      });
      await db.release();
    } else {
      // If the user does not provide a password, just update the user's name and email
      const userObj2 = await db.queryObject({
        text:
          `UPDATE "users" SET name = $1, email = $2 WHERE "uuid" = $3 RETURNING name, email, "uuid", created_at, updated_at;`,
        args: [name, email, ctx.state.JWTclaims.id],
        fields: ["name", "email", "uuid", "created_at", "updated_at"],
      });

      const user = userObj2.rows[0];

      const accessToken = await makeAccesstoken(userObj2);
      const refreshToken = await makeRefreshtoken(userObj2);

      ctx.response.status = Status.OK;
      ctx.response.headers.set(
        "x-authc-client-origin",
        `${config.CLIENTORIGIN}`,
      );
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });
      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          id: user.uuid,
          type: "Updated User",
          attributes: {
            name: user.name,
            email: user.email,
            created: user.created_at,
            updated: user.updated_at,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
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
