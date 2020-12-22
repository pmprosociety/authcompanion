import app from "../app.ts";
import { config } from "../deps.ts";
import log from "../helpers/log.ts";

const env = config();

const PORT: number = Number(env.PORT) || 3000;
const controller = new AbortController();
const { signal } = controller;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  log.debug(`HTTPS is ${secure ? "on" : "off"}`)
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  log.info(`🚀 Ready on ${url}`);
  log.info('Use CTRL-C to shutdown AuthCompanion')
});

const server =  app.listen({ port: PORT, signal });

// Listen for SigTerm (Docker shutdown) SigInt (CTRL-C) and SIGABRT.
await Promise.any([Deno.signal(Deno.Signal.SIGTERM), Deno.signal(Deno.Signal.SIGINT), Deno.signal(Deno.Signal.SIGABRT)]);

log.info("🛑 Stopping AuthCompanion")
// Signal Oak to Shutdown
controller.abort();
// Wait for Oak to shutdown
await server;
log.info("👋 Good bye")
Deno.exit();
