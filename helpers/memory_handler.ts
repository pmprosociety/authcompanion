import { log, LogRecord } from "../deps.ts";

class MemoryHandler extends log.handlers.BaseHandler {
  public messages: string[] = [];

  handle(logRecord: LogRecord): void {
    super.handle(logRecord);
    if (logRecord.args.includes("memory-clear")) {
      this.clear();
    }
  }

  clear(): void {
    this.messages = [];
  }

  public log(str: string): void {
    this.messages.push(str);
  }
}
export default MemoryHandler;
