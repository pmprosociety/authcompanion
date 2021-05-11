import config from "./setup.ts";
import { Application, BaseHandler } from "../test_deps.ts";
import { assertEquals, assertExists } from "../test_deps.ts";
import { sendHook } from "../services/webhook.ts";
import logger from "../helpers/log.ts";
import MemoryHandler from "../helpers/memory_handler.ts";

const app = new Application();
const controller = new AbortController();
const { signal } = controller;

const getMemoryHandler = (handlers: BaseHandler[]): MemoryHandler | null => {
  let handler = null;
  handlers.forEach((val) => {
    if (val instanceof MemoryHandler) {
      handler = val;
    }
  });
  return handler;
};

const clearLogger = () => {
  logger.debug("", "memory-clear");
};

const webhookMonitor = (): Promise<void> => {
  app.use((ctx) => {
    ctx.response.body = "Hello World!";
  });

  return app.listen({ port: 15000, signal });
};

Deno.test("Webhook Service Test: No URL doesnt crash", async () => {
  config.WEBHOOKURL = "";
  await sendHook({ name: "Test", data: {} });
  const mh = getMemoryHandler(logger.handlers);
  assertEquals(mh?.messages.length, 0);
  clearLogger();
});

Deno.test("Webhook Service Test: Undefined URL Doesnt crash", async () => {
  config.WEBHOOKURL = undefined;
  await sendHook({ name: "Test", data: {} });
  const mh = getMemoryHandler(logger.handlers);
  assertEquals(mh?.messages.length, 0);
  clearLogger();
});

// Deno.test({
//   name: "Webhook works",
//   async fn() {
//     const server = webhookMonitor();
//     config.WEBHOOKURL = "http://localhost:15000";
//     await sendHook({ name: "Test", data: {} });
//     const mh = getMemoryHandler(logger.handlers);
//     assertEquals(mh?.messages.length, 1);
//     clearLogger();
//     controller.abort();
//     await server;
//   },
//   sanitizeOps: false,
//   sanitizeResources: false,
// });
