import { Status } from "../deps.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

export const logoutUser = async (ctx: any) => {
  try {
    await db.connect();

    const userObj = await db.query(
      `SELECT * FROM "users" WHERE "UUID" = $1;`,
      ctx.state.JWTclaims.id,
    );

    if (userObj.rowCount == 0) {
      log.warning("Unable to find user to logout");
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
      await db.end();
    }

    const result = await db.query(
      `Update "users" SET "refresh_token" = '' WHERE "UUID" = $1 RETURNING *;`,
      ctx.state.JWTclaims.id,
    );

    const objectRows = result.rowsOfObjects();
    const user = objectRows[0];

    ctx.response.status = Status.OK;
    ctx.response.body = {
      data: {
        id: user.UUID,
        type: "Logout User",
        attributes: {
          name: user.name,
          email: user.email,
          updated_at: user.updated_at,
        },
      },
    };
    await db.end();
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
