import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { v4 } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";

export const updateUser = async (ctx: any) => {
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

    const userObj = await db.query(
      `SELECT * FROM "users" WHERE "UUID" = $1;`,
      ctx.state.JWTclaims.id,
    );

    if (userObj.rowCount == 0) {
      log.warning("Unable to find user to update");
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
    }

    if (password) {
      const hashpassword = await hash(password);
      const jtiClaim = v4.generate();

      const result = await db.query(
        `Update "users" SET name = $1, email = $2, password = $3, refresh_token = $4 WHERE "UUID" = $5 RETURNING *;`,
        name,
        email,
        hashpassword,
        jtiClaim,
        ctx.state.JWTclaims.id,
      );

      const objectRows = result.rowsOfObjects();
      const user = objectRows[0];

      const accessToken = await makeAccesstoken(result);
      const refreshToken = await makeRefreshtoken(result);

      ctx.response.status = Status.OK;
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });
      ctx.response.body = {
        data: {
          id: user.UUID,
          type: "Updated User",
          attributes: {
            name: user.name,
            email: user.email,
            updated_at: user.updated_at,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
      await db.release();
    } else {
      const result = await db.query(
        `UPDATE "users" SET name = $1, email = $2 WHERE "UUID" = $3 RETURNING *;`,
        name,
        email,
        ctx.state.JWTclaims.id,
      );

      const objectRows = result.rowsOfObjects();
      const user = objectRows[0];

      const accessToken = await makeAccesstoken(result);
      const refreshToken = await makeRefreshtoken(result);

      ctx.response.status = Status.OK;
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });
      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          id: user.UUID,
          type: "Updated User",
          attributes: {
            name: user.name,
            email: user.email,
            updated_at: user.updated_at,
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
  } finally {
  }
};
