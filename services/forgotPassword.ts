// @ts-nocheck
import { Status } from "../deps.ts";
import { makeRecoverytoken } from "../helpers/jwtutils.ts";
import { db } from "../db/db.ts";
import log from "../helpers/log.ts";
import { SmtpClient } from "../deps.ts";
import { superstruct } from "../deps.ts";
import {
  FROMADDRESS,
  RECOVERYURL,
  SMTPHOSTNAME,
  SMTPPASSWORD,
  SMTPPORT,
  SMTPUSER,
} from "../config.ts";

const connectConfig: any = {
  hostname: SMTPHOSTNAME,
  port: Number(SMTPPORT),
  username: SMTPUSER,
  password: SMTPPASSWORD,
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
    const userObj = await db.queryObject({
      text: `SELECT email FROM users WHERE email = $1;`,
      args: [email],
      fields: ["email"]
    });

    const user = userObj.rows[0];

    //if the request has a user that exists in DB, issue an account recovery email
    if (userObj.rowCount !== 0) {
      const client = new SmtpClient();

      await client.connect(connectConfig);

      const recoveryToken = await makeRecoverytoken(userObj);

      await client.send({
        from: FROMADDRESS ?? "no-reply@example.com",
        to: user.email,
        subject: "Account Recovery",
        content: `Hello 👋 </br>
          You are receiving this email because you have attempted to recover your account</br>
          Please use the following link to login again: <a href="${RECOVERYURL}?token=${recoveryToken.token}">Click Here</a>`,
      });
      await db.release();

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
