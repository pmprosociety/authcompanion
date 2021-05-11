import { delay } from "../deps.ts";
import config from "../config.ts";
import log from "../helpers/log.ts";

interface WebhookPayload {
  name: string;
  data: Record<string, unknown>;
}

export const sendHook = async (payload: WebhookPayload) => {
  if (config.WEBHOOKURL == undefined || `${config.WEBHOOKURL}` === "") {
    return;
  }
  try {
    let resp;
    for (let retry = 0; retry < 3; retry++) {
      resp = await fetch(`${config.WEBHOOKURL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret: config.WEBHOOKSECRET, ...payload }),
      });
      log.debug("Sent webhook", {
        url: config.WEBHOOKURL,
        status: resp?.status,
      });
      if (resp.status !== 200) {
        await delay(100 * retry + 1);
        continue;
      }
      return;
    }
    log.error("Unable to send webhook", {
      url: config.WEBHOOKURL,
      status: resp?.status,
    });
  } catch (e) {
    log.error(e);
  }
};
