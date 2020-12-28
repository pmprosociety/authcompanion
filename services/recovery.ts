import { Status } from "../deps.ts";
import { validate } from "../deps.ts";
import { makeRecoverytoken } from "../helpers/jwtutils.ts";
import { recoverySchema } from "./schemas.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { SmtpClient } from "../deps.ts";
import { config } from "../deps.ts";

const env = config();

const connectConfig: any = {
  hostname: env.SMTP_HOSTNAME,
  port: +env.SMTP_PORT,
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

    //Request Body Validation
    const [passes, errors] = await validate(bodyValue, recoverySchema);

    if (!passes) {
      log.debug("Request did not pass body validation");
      ctx.throw(Status.BadRequest, errors);
    }

    const { email } = bodyValue;

    await db.connect();

    const userObj = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      email,
    );

    const objectRows = userObj.rowsOfObjects();
    const user = objectRows[0];

    //if the request has a user that exists in DB, issue an account recovery email
    if (userObj.rowCount !== 0) {
      const client = new SmtpClient();

      await client.connect(connectConfig);

      const recoveryToken = await makeRecoverytoken(userObj);

      await client.send({
        from: env.FROM_ADDRESS,
        to: user.email,
        subject: "Account Recovery",
        content:
          `Hello </br> Please use the following link to sign into your account: <a href="${env.RECOVERY_REDIRECT_URL}?token=${recoveryToken.token}">Click Here</a>`,
      });
      await client.close();

      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          type: "Recover User",
          detail:
            "An email containing a recovery link has been sent to the email address provided",
        },
      };
    } else {
      // if the request has no valid email, simulate an email being sent
      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          type: "Recover User",
          detail:
            "An email containing a recovery link has been sent to the email address provided.",
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
