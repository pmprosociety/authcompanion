import {config, log} from "../deps.ts";

const env = config();

const level: log.LevelName = env.LOGLEVEL ? <log.LevelName> env.LOGLEVEL.toUpperCase() : "INFO";
const handler = env.LOGHANDLER || "console"

await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler(level),
    },
    loggers: {
        default: {
            level: level,
            handlers: [handler],
        }
    }
});

export default log.getLogger();
