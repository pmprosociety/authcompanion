import { Status } from "../deps.ts";
import { hash } from "../deps.ts";
import { validate } from "../deps.ts";
import { v4 } from "../deps.ts";
import {
  makeAccesstoken,
  makeRefreshtoken,
} from "../helpers/jwtutils.ts";
import { updateSchema } from "../services/schemas.ts";
import { db } from "../db/db.ts";

export const updateUser = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      ctx.throw(Status.BadRequest, "Bad Request");
    }

    const [passes, errors] = await validate(bodyValue, updateSchema);

    if (!passes) {
      ctx.throw(Status.BadRequest, errors);
    }

    const { name, email, password } = bodyValue;

    await db.connect();

    const userObj = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      ctx.state.JWTclaims.email,
    );

    if (userObj.rowCount == 0) {
      ctx.throw(
        Status.BadRequest,
        "Unable to process request, please try again",
      );
    }

    if (password) {
      const hashpassword = await hash(password);
      const jtiClaim = v4.generate();

      const result = await db.query(
        "Update users SET name = $1, email = $2, password = $3, refresh_token = $4 WHERE email = $5 RETURNING *;",
        name,
        email,
        hashpassword,
        jtiClaim,
        ctx.state.JWTclaims.email,
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
      await db.end();
    } else {
      const result = await db.query(
        "UPDATE users SET name = $1, email = $2 WHERE email = $3 RETURNING *;",
        name,
        email,
        ctx.state.JWTclaims.email,
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
      await db.end();
    }
  } catch (err) {
    console.log(err);
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
