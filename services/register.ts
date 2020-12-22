import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { validate } from "../deps.ts";
import { v4 } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { registrationSchema } from "../services/schemas.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";

// api/v1/auth/register
export const register = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      ctx.throw(Status.BadRequest, "Bad Request");
    }
    //validate body schema
    const [passes, errors] = await validate(bodyValue, registrationSchema);

    if (!passes) {
      ctx.throw(Status.BadRequest, errors);
    }

    const { name, email, password } = bodyValue;

    await db.connect();

    const userAlreadyExists = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      email,
    );

    if (userAlreadyExists.rowCount !== 0) {
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
      await db.end();
    }

    const hashpassword = await hash(password);
    const jtiClaim = v4.generate();

    const result = await db.query(
      "INSERT INTO users (name, email, password, isactive, refresh_token) VALUES ($1, $2, $3, '1', $4) RETURNING *;",
      name,
      email,
      hashpassword,
      jtiClaim,
    );

    const objectRows = result.rowsOfObjects();
    const user = objectRows[0];

    const accessToken = await makeAccesstoken(result);
    const refreshToken = await makeRefreshtoken(result);

    ctx.response.status = Status.Created;
    ctx.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      expires: new Date("2022-01-01T00:00:00+00:00"),
    });
    ctx.response.body = {
      data: {
        id: user.UUID,
        type: "Register",
        attributes: {
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          access_token: accessToken.token,
          access_token_expiry: accessToken.expiration,
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
