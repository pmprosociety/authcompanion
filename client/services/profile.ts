import { Status } from "../../deps.ts";
import { validateJWT } from "../../helpers/jwtutils.ts";
import log from "../../helpers/log.ts";

export const profile = async (ctx: any) => {
  try {
    let recoveryToken = ctx.request.url.searchParams.get("token");

    if (recoveryToken) {
      await validateJWT(recoveryToken);
    }

    const body = await Deno.readTextFile(
      Deno.cwd() + "/client/profile_page.html",
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
