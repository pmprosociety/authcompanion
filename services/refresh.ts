import { Status } from "../deps.ts";
import {
  makeAccesstoken,
  makeRefreshtoken,
  validateRefreshToken,
} from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

export const refresh = async (ctx: any) => {
  try {
    const refreshToken = ctx.cookies.get("refreshToken");

    if (!refreshToken) {
      ctx.throw(Status.BadRequest, "No Refresh Token Found");
    }

    let validatedjwt = await validateRefreshToken(refreshToken);

    if (validatedjwt) {
      const userObj = await db.queryObject({
        text:
          `SELECT name, email, "uuid", refresh_token, active, created_at, updated_at FROM users WHERE refresh_token = $1;`,
        args: [validatedjwt?.payload.jti],
        fields: [
          "name",
          "email",
          "uuid",
          "refresh_token",
          "active",
          "created_at",
          "updated_at",
        ],
      });

      if (userObj.rowCount == 0) {
        ctx.throw(Status.BadRequest, "Invalid Refresh Token");
        await db.release();
      }

      const user = userObj.rows[0];

      if (!user.active) {
        ctx.throw(Status.Forbidden, "User has been disabled");
        await db.release();
      }

      const accessToken = await makeAccesstoken(userObj);
      const newRefreshToken = await makeRefreshtoken(userObj);

      ctx.response.status = Status.OK;
      ctx.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });

      ctx.response.body = {
        data: {
          id: user.uuid,
          type: "Refresh",
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
    } else {
      ctx.throw(Status.BadRequest, "Invalid Refresh Token");
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
