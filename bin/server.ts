import app from "../app.ts";
import log from "../helpers/log.ts";
import config from "../config.ts";

const PORT: number = Number(config.AUTHPORT ?? 3002);
const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  log.debug(`HTTPS is ${secure ? "on" : "off"}`);
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  log.info(`
  ################################################
  🚀  Server listening on: ${url} 
  ################################################
  `);
  log.info("Use CTRL-C to shutdown AuthCompanion");
});

const server = app.listen({ port: PORT, signal });

// Listen for SigTerm (Docker shutdown) SigInt (CTRL-C) and SIGABRT.
await Promise.any(
  [
    Deno.signal(Deno.Signal.SIGTERM),
    Deno.signal(Deno.Signal.SIGINT),
    Deno.signal(Deno.Signal.SIGABRT),
  ],
);

log.info(` 🛑 Stopping AuthCompanion`);

// In order to close the sever...
controller.abort();

// Listen will stop listening for requests and the promise will resolve...
await server;

log.info(` Good bye 👋`);

Deno.exit();
