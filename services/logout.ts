// @ts-nocheck
import { Status } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

export const logout = async (ctx: any) => {
  try {
    const userObj = await db.queryObject({
      text: `SELECT email FROM users WHERE "uuid" = $1;`,
      args: [ctx.state.JWTclaims.id],
      fields: ["email"],
    });

    if (userObj.rowCount == 0) {
      log.warning("Unable to find user to logout");
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
      await db.release();
    }

    const result = await db.queryObject({
      text:
        `Update "users" SET "refresh_token" = '' WHERE "uuid" = $1 RETURNING name, email, "uuid";`,
      args: [ctx.state.JWTclaims.id],
      fields: ["name", "email", "uuid"],
    });

    const user = result.rows[0];

    ctx.response.status = Status.OK;
    ctx.response.body = {
      data: {
        id: user.uuid,
        type: "Logout User",
        attributes: {
          name: user.name,
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
