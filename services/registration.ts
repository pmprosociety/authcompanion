// @ts-nocheck
import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { v4 } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { superstruct } from "../deps.ts";

export const registration = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      log.warning("No body");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      log.warning("Body not JSON");
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    // validate request body against a schmea
    const registrationSchema = superstruct.object({
      name: superstruct.string(),
      email: superstruct.string(),
      password: superstruct.string(),
    });

    superstruct.assert(bodyValue, registrationSchema);

    const { name, email, password } = bodyValue;

    const userAlreadyExists = await db.queryObject({
      text: "SELECT email FROM users WHERE email = $1;",
      args: [email],
      fields: ["email"],
    });

    if (userAlreadyExists.rowCount !== 0) {
      log.warning("User already exists");
      await db.release();
      ctx.throw(
        Status.BadRequest,
        "Bad Request",
      );
    }

    const hashpassword = await hash(password);
    const jtiClaim = v4.generate();

    const userObj = await db.queryObject({
      text:
        `INSERT INTO users (name, email, password, active, refresh_token) VALUES ($1, $2, $3, '1', $4) RETURNING name, email, "uuid", refresh_token, created_at, updated_at;`,
      args: [name, email, hashpassword, jtiClaim],
      fields: [
        "name",
        "email",
        "uuid",
        "refresh_token",
        "created_at",
        "updated_at",
      ],
    });

    let user = userObj.rows[0];
    const accessToken = await makeAccesstoken(userObj);
    const refreshToken = await makeRefreshtoken(userObj);

    ctx.response.status = Status.Created;
    ctx.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      expires: new Date("2022-01-01T00:00:00+00:00"),
    });
    ctx.response.body = {
      data: {
        id: user.uuid,
        type: "Register",
        attributes: {
          name: user.name,
          email: user.email,
          created: user.created_at,
          access_token: accessToken.token,
          access_token_expiry: accessToken.expiration,
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
