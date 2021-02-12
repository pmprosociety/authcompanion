import { log } from "../deps.ts";

const level: log.LevelName = Deno.env.get("LOGLEVEL")
  ? <log.LevelName> Deno.env.get("LOGLEVEL")?.toUpperCase()
  : "INFO";
const handler = Deno.env.get("LOGHANDLER") ?? "console";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler(level),
  },
  loggers: {
    default: {
      level: level,
      handlers: [handler],
    },
  },
});

export default log.getLogger();
