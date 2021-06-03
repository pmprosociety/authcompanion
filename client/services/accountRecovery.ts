import { Status } from "../../deps.ts";
import log from "../../helpers/log.ts";

export const accountRecovery = async (ctx: any) => {
  try {
    const body = await Deno.readTextFile(
      Deno.cwd() + "/client/recovery_page.html",
    );

    ctx.response.status = Status.OK;
    ctx.response.body = body;
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
  }
};
