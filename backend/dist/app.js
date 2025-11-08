"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const GameManager_1 = require("@game/GameManager");
const API_1 = require("@/API");
const logger_1 = require("./common/logger");
const path_1 = require("path");
const dotenv_1 = __importDefault(require("dotenv"));
try {
    dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
    exports.logger = new logger_1.Logger();
    exports.logger.info("Environment variables loaded from '../.env'");
    try {
        const gameManager = new GameManager_1.GameManager(String(process.env.BACKEND_IP), Number(process.env.BACKEND_PORT));
        gameManager.start();
    }
    catch (error) {
        exports.logger.error("Couldn't start the game manager", error);
    }
    try {
        const api = new API_1.API();
        api.start(String(process.env.API_IP), Number(process.env.API_PORT));
        api.registeringAllRoutes();
    }
    catch (error) {
        exports.logger.error("Couldn't start the api", error);
    }
}
catch (error) {
    exports.logger.error("Critical error. Server is stopping", error);
}
