import { Status } from "../deps.ts";
import { compare } from "../deps.ts";
import { validate } from "../deps.ts";
import { makeAccesstoken, makeRefreshtoken } from "../helpers/jwtutils.ts";
import { loginSchema } from "../services/schemas.ts";
import { db } from "../db/db.ts";

// /api/v1/auth/login
export const login = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.throw(Status.BadRequest, "Bad Request, No Request Body");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      ctx.throw(Status.BadRequest, "Bad Request, Incorrect Body Type");
    }

    //validate body schema
    const [passes, errors] = await validate(bodyValue, loginSchema);

    if (!passes) {
      ctx.throw(Status.BadRequest, errors);
    }

    const { email, password } = bodyValue;

    await db.connect();

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      email,
    );

    if (result.rowCount == 0) {
      ctx.throw(Status.BadRequest, "Bad Request, Please Retry Login");
      await db.end();
    }

    const objectRows = result.rowsOfObjects();
    const user = objectRows[0];

    if (!user.isactive) {
      ctx.throw(
        Status.Forbidden,
        "Bad Request, Please Retry Login",
      );
      await db.end();
    }

    if (await compare(password, user.password)) {
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
          type: "Login",
          attributes: {
            name: user.name,
            email: user.email,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
      await db.end();
    } else {
      ctx.throw(
        Status.BadRequest,
        "Username or Password is Invalid, Please Retry Login",
      );
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
