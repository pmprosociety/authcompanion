import { Status } from "../deps.ts";
import { makeRecoverytoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { SmtpClient } from "../deps.ts";
import { superstruct } from "../deps.ts";

const connectConfig: any = {
  hostname: Deno.env.get("SMTP_HOSTNAME"),
  port: Number(Deno.env.get("SMTP_PORT")),
  username: Deno.env.get("SMTP_USERNAME"),
  password: Deno.env.get("SMTP_PASSWORD"),
};

export const forgotPassword = async (ctx: any) => {
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

    // validate request body against a schema
    const recoverySchema = superstruct.object({
      email: superstruct.string(),
    });

    superstruct.assert(bodyValue, recoverySchema);

    const { email } = bodyValue;
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
        from: Deno.env.get("FROM_ADDRESS") ?? "no-reply@example.com",
        to: user.email,
        subject: "Account Recovery",
        content:
          `Hello </br> Please use the following link to sign into your account: <a href="${
            Deno.env.get("RECOVERY_REDIRECT_URL")
          }?token=${recoveryToken.token}">Click Here</a>`,
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
      // if the request has no valid email in the db, simulate an email being sent
      ctx.response.status = Status.OK;
      ctx.response.body = {
        data: {
          type: "Recover User",
          detail:
            "An email containing a recovery link has been sent to the email address provided.",
        },
      };
    }

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
