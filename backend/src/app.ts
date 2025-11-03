import { GameManager } from '@game/GameManager';
import { API } from '@/API';

const gameManager = new GameManager(String(process.env.BACKEND_IP), Number(process.env.BACKEND_PORT));
gameManager.start();


const portAPI: number = Number(process.env.API_PORT) || 3000;
const hostIP: string = process.env.API_IP || 'localhost';

const api = new API();
api.start(hostIP, portAPI);
