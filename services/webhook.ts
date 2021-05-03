import { delay } from "../deps.ts";
import { WEBHOOKSECRET, WEBHOOKURL } from "../config.ts";
import log from "../helpers/log.ts";

interface WebhookPayload {
  name: string;
  data: object;
}

export const sendHook = async (payload: WebhookPayload) => {
  if (`${WEBHOOKURL}` === "") {
    return;
  }
  try {
    let resp;
    for (let retry = 0; retry < 3; retry++) {
      resp = await fetch(`${WEBHOOKURL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secret: WEBHOOKSECRET, ...payload }),
      });
      log.debug("Sent webhook", { url: WEBHOOKURL, status: resp?.status });
      if (resp.status !== 200) {
        await delay(100 * retry + 1);
        continue;
      }
      return;
    }
    log.error("Unable to send webhook", {
      url: WEBHOOKURL,
      status: resp?.status,
    });
  } catch (e) {
    log.error(e);
  }
};
