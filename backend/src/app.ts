import { GameManager } from '@game/GameManager';
import { API } from '@/API';
import { Logger } from './common/logger';
import { resolve } from 'path';
import dotenv from 'dotenv';

export let logger!: Logger;

try {

  dotenv.config({ path: resolve(__dirname, '../.env') });
  logger = new Logger();
  logger.info("Environment variables loaded from '../.env'");

  try {
    const gameManager = new GameManager(String(process.env.BACKEND_IP), Number(process.env.BACKEND_PORT));
    gameManager.start();
  } catch (error) {
    logger.error("Couldn't start the game manager", error);
  }

  try {
    const api = new API();
    api.start(String(process.env.API_IP), Number(process.env.API_PORT));
    api.registeringAllRoutes();
  } catch (error) {
    logger.error("Couldn't start the api", error);
  }

} catch (error) {
  logger.error("Critical error. Server is stopping", error);
}


