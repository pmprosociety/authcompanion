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
      const result = await db.queryArray(
        "SELECT * FROM users WHERE refresh_token = $1;",
        validatedjwt?.payload.jti,
      );

      if (result.rowCount == 0) {
        ctx.throw(Status.BadRequest, "Invalid Refresh Token");
        await db.release();
      }

      const user = result.rows[0];

      // @ts-ignore
      if (!user.active) {
        ctx.throw(Status.Forbidden, "User has been disabled");
        await db.release();
      }

      const accessToken = await makeAccesstoken(result);
      const newRefreshToken = await makeRefreshtoken(result);

      ctx.response.status = Status.OK;
      ctx.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });

      ctx.response.body = {
        data: {
          // @ts-ignore
          id: user.UUID,
          type: "Refresh",
          attributes: {
            // @ts-ignore
            email: user.email,
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
