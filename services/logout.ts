import { Status } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

export const logoutUser = async (ctx: any) => {
  try {
    const userObj = await db.queryObject(
      `SELECT * FROM "users" WHERE "UUID" = $1;`,
      ctx.state.JWTclaims.id,
    );

    if (userObj.rowCount == 0) {
      log.warning("Unable to find user to logout");
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
      await db.release();
    }

    const result = await db.queryArray(
      `Update "users" SET "refresh_token" = '' WHERE "UUID" = $1 RETURNING *;`,
      ctx.state.JWTclaims.id,
    );

    const user = result.rows[0];

    ctx.response.status = Status.OK;
    ctx.response.body = {
      data: {
        // @ts-ignore
        id: user.UUID,
        type: "Logout User",
        attributes: {
          // @ts-ignore
          name: user.name,
          // @ts-ignore
          email: user.email,
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
