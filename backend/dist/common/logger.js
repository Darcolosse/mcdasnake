"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const levelColors = {
    "debug": "\x1b[36m", // Cyan
    "info": "\x1b[0m", // White
    "warn": "\x1b[33m", // Yellow
    "error": "\x1b[31m", // Red
};
class Logger {
    filePath;
    constructor() {
        this.filePath = `${String(process.env.LOG_DIR)}${String(process.env.LOG_FILENAME)}`;
        this.debug(`Given log file at ${this.filePath}`);
        if (!fs_1.default.existsSync(path_1.default.dirname(this.filePath))) {
            fs_1.default.mkdirSync(path_1.default.dirname(this.filePath), { recursive: true });
            this.debug(`Created log file at ${this.filePath}`);
        }
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        const color = levelColors[level];
        const reset = "\x1b[0m";
        return `${color}[${timestamp}] [${level.toUpperCase()}] ${message} ${reset}`;
    }
    writeToFile(formatted) {
        fs_1.default.appendFileSync(this.filePath, formatted.replace(/\x1b\[\d+m/g, "") + "\n");
    }
    log(level, ...data) {
        try {
            const firstElement = data.shift();
            if (typeof firstElement === "string") {
                const formatted = this.formatMessage(level, firstElement);
                if (String(process.env.LOG_VERBOSE) === "TRUE" && data.length > 0)
                    console.log(formatted, data);
                else
                    console.log(formatted);
                try {
                    this.writeToFile(formatted);
                }
                catch (error) {
                    console.error("Couldn't write most recent log", error);
                }
            }
            else {
                const all = [firstElement, ...data];
                console.log(all);
            }
        }
        catch (error) {
            console.error("Couldn't log a message", error);
        }
    }
    debug(...data) { if (process.env.LOG_ENABLE_DEBUG == "TRUE")
        this.log("debug", ...data); }
    info(...data) { this.log("info", ...data); }
    warn(...data) { this.log("warn", ...data); }
    error(...data) { this.log("error", ...data); }
}
exports.Logger = Logger;
