import { log } from "../deps.ts";
import { LOGHANDLER, LOGLEVEL } from "../config.ts";

const level: log.LevelName = LOGLEVEL
  ? <log.LevelName> LOGLEVEL?.toUpperCase()
  : "INFO";
const handler = LOGHANDLER ?? "console";

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
