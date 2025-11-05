import fs from "fs";
import path from "path";

const levelColors: Record<string, string> = {
  "debug": "\x1b[36m", // Cyan
  "info": "\x1b[0m",  // White
  "warn": "\x1b[33m",  // Yellow
  "error": "\x1b[31m", // Red
};

export class Logger {
  private filePath: string;

  constructor() {
    this.filePath = `${String(process.env.LOG_DIR)}${String(process.env.LOG_FILENAME)}`
    this.debug(`Given log file at ${this.filePath}`)

    if (!fs.existsSync(path.dirname(this.filePath))) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      this.debug(`Created log file at ${this.filePath}`)
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    const color = levelColors[level];
    const reset = "\x1b[0m";

    return `${color}[${timestamp}] [${level.toUpperCase()}] ${message} ${reset}`;
  }

  private writeToFile(formatted: string) {
    fs.appendFileSync(this.filePath, formatted.replace(/\x1b\[\d+m/g, "") + "\n");
  }

  private log(level: string, ...data: any[]) {
    try {
      const firstElement = data.shift();
      if (typeof firstElement === "string") {
        const formatted = this.formatMessage(level, firstElement);
        if(String(process.env.LOG_VERBOSE) === "TRUE" && data.length > 0) console.log(formatted, data);
        else console.log(formatted);

        try {
          this.writeToFile(formatted);
        } catch (error) {
          console.error("Couldn't write most recent log", error);
        }
      } else {
        const all = [firstElement, ...data]
        console.log(all);
      }
    } catch (error) {
      console.error("Couldn't log a message", error);
    }
  }

  debug(...data: any[]) { if(process.env.LOG_ENABLE_DEBUG == "TRUE") this.log("debug", ...data); }
  info(...data: any[]) { this.log("info", ...data); }
  warn(...data: any[]) { this.log("warn", ...data); }
  error(...data: any[]) { this.log("error", ...data); }
}

