import app from "../app.ts";
import log from "../helpers/log.ts";
import { AUTHPORT } from "../config.ts";

const PORT: number = Number(AUTHPORT ?? 3002);
const controller = new AbortController();
const { signal } = controller;

// @ts-ignore
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
    // @ts-ignore
    Deno.signal(Deno.Signal.SIGTERM),
    // @ts-ignore
    Deno.signal(Deno.Signal.SIGINT),
    // @ts-ignore
    Deno.signal(Deno.Signal.SIGABRT),
  ],
);

log.info("🛑 Stopping AuthCompanion");
// Signal Oak to Shutdown
controller.abort();
// Wait for Oak to shutdown
await server;
log.info("Good bye 👋 ");
Deno.exit();
