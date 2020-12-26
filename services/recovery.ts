import { Status } from "../deps.ts";
import { validate } from "../deps.ts";
import {
  makeAccesstoken,
  makeRecoverytoken,
  makeRefreshtoken,
  validateJWT,
} from "../helpers/jwtutils.ts";
import { recoverySchema } from "./schemas.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";

const env = config();

const connectConfig: any = {
  hostname: env.SMTP_HOSTNAME,
  port: 2525,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
};

export const recoverUser = async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      log.debug("Request has no body");
      ctx.throw(Status.BadRequest, "Bad Request, Please Try Again");
    }

    let body = await ctx.request.body();
    let bodyValue = await body.value;

    if (body.type !== "json") {
      log.debug("Request body is not JSON");
      ctx.throw(Status.BadRequest, "Bad Request, Please Try Again");
    }

    // Need a good scheme for request validation
    // const [passes, errors] = await validate(bodyValue, recoverySchema);

    // if (!passes) {
    //   log.debug("Request did not pass body validation");
    //   ctx.throw(Status.BadRequest, errors);
    // }

    const { email, token } = bodyValue;

    await db.connect();

    const userObj = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      email,
    );

    const objectRows = userObj.rowsOfObjects();
    const user = objectRows[0];

    //if the request has a valid recovery token and the user exists, issue new access token
    if (token && userObj.rowCount !== 0) {
      let validatedtoken = await validateJWT(token);

      const accessToken = await makeAccesstoken(userObj);
      const refreshToken = await makeRefreshtoken(userObj);

      ctx.response.status = Status.OK;
      ctx.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date("2022-01-01T00:00:00+00:00"),
      });
      ctx.response.body = {
        data: {
          id: validatedtoken.payload.id,
          type: "Recovery Login",
          attributes: {
            name: validatedtoken.payload.name,
            email: validatedtoken.payload.email,
            access_token: accessToken.token,
            access_token_expiry: accessToken.expiration,
          },
        },
      };
      // if the request has no token and the user exists, issue the account recovery mail 
    } else if (userObj.rowCount !== 0) {

      const client = new SmtpClient();

      await client.connect(connectConfig);

      const recoveryToken = await makeRecoverytoken(userObj);

      await client.send({
        from: env.FROM_ADDRESS,
        to: user.email,
        subject: "Account Recovery",
        content:
          `Hello </br> Please use the following link to sign into your account: <a href="http://localhost:3001/api/v1/auth/?token=${recoveryToken.token}">Click Here</a>`,
      });
      await client.close();

      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          type: "Recover User",
          detail:
            "An email contianing a recovery link has been sent to the email address provided",
        },
      };
    } else {
      // if the request has no valid email, simulate an email being sent
      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          type: "Recover User",
          detail:
            "An email contianing a recovery link has been sent to the email address provided.",
        },
      };
    }

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
