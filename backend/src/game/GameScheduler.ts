import { GameRefreshResponseDTO } from "@network/dto/responses/GameRefreshResponseDTO";
import { Game } from "@game/Game";
import { GameManager, Buffers, Event } from "@game/GameManager";
import { GameUpdateSnakeDirectionDTO } from "@network/dto/requests/GameUpdateSnakeDirectionDTO";
import { GameAddPlayerDTO } from "@network/dto/requests/GameAddPlayerDTO";
import { GameDeadPlayerDTO } from "@/network/dto/responses/GameDeadPlayerDTO";
import { logger } from "@/app";
import { Death } from "@/entities/Death";
import { EntityType } from "@/entities/Entity";

export class GameScheduler {
  private readonly game: Game;
  private readonly gameManager: GameManager;

  private gameLoop!: NodeJS.Timeout;
  private tickCount!: number;
  private gameTickRateMs!: number;
  private gameSpeedMs: number;
  private gameDuration!: NodeJS.Timeout;
  private timeLeft: number;
  private gameRestart!: NodeJS.Timeout;
  private restartTimeBeforeRestart: number;

  constructor(gameManager: GameManager, game: Game) {
    this.gameManager = gameManager;
    this.game = game;
    this.gameSpeedMs = Number(process.env.GAME_SPEED_MS);
    for(const rateTry of [5,3,2,1]) {
      if(this.gameSpeedMs % rateTry === 0) {
        this.gameTickRateMs = this.gameSpeedMs / rateTry;
        break;
      }
    }
    this.timeLeft = this.game.GetGameSessionDuration();
    this.restartTimeBeforeRestart = Number(process.env.GAME_RESTART_DELAY_S);
  }

  // ====================== Vertical layer ======================= \\

  public start() {
    this.tickCount = 0;
    this.gameLoop = setInterval(this.onTick.bind(this), this.gameTickRateMs);
    this.gameDuration = setInterval(this.startGameSessionTimer.bind(this), 1000);
  }

  public stop() {
    clearInterval(this.gameLoop);
  }

  public stopGameSession() {
    clearInterval(this.gameDuration);
    this.stop();

    this.gameRestart = setInterval(this.restartGameSessionTimer.bind(this), 1000);    
  }

  // ===================== Management layer ====================== \\

  private onTick() {
    this.tickCount += this.gameTickRateMs;

    // ### Game refresh barebone ###
    const gameRefresh: GameRefreshResponseDTO = new GameRefreshResponseDTO();

    // #                 #
    // # Realtime events #
    // #                 #
    this.gameManager.popBuffer(Buffers.CONNECTION_BUFFER).forEach((connection) => {
      if (this.game.isSnakePlaying(connection.id)) this.onRemove(connection.id, gameRefresh);
      this.onAdd(connection, gameRefresh);
    })

    this.gameManager.popBuffer(Buffers.DECONNECTION_BUFFER).forEach((deconnection) => {
      this.onRemove(deconnection.id, gameRefresh);
    })

    // #                  #
    // # Bonus generation #
    // #                  #
    this.game.processGenerateBonus(gameRefresh);

    // #           #
    // # Game step #
    // #           #
    if (this.tickCount % this.gameSpeedMs == 0) {
      this.onGameStep(gameRefresh);
    }

    // #                        #
    // # Notifying game refresh #
    // #                        #
    if (!gameRefresh.isEmpty()) {

      gameRefresh.scoreBoard = this.game.getScore();

      this.gameManager.handleGameEvent(gameRefresh);

      for (const removedEntity of gameRefresh.entities.removed) {
        console.log("Removed entity: ", removedEntity);
        this.gameManager.handleGameEvent(removedEntity, removedEntity.deadPlayerId);
      }
    }
  }

  private onGameStep(gameRefresh: GameRefreshResponseDTO) {
    this.gameManager.popBuffer(Buffers.TURN_BUFFER).forEach((event) => {
      this.game.updateDirection(event.id, (event.dto as GameUpdateSnakeDirectionDTO).direction)
    })

		this.game.processMove(gameRefresh);
		this.game.processCollisions(gameRefresh);
  }

  private startGameSessionTimer() {
    this.timeLeft -= 1;
    this.game.setGameSessionDuration(this.timeLeft);
    if (this.timeLeft <= 0) {
      this.stopGameSession();
    }
    if (this.timeLeft % 30 === 0 || this.timeLeft <= 10) {
      logger.info("Time left in game (" + this.game.GetGameSessionId() + "): " + this.timeLeft + " s");
    }
  }

  private restartGameSessionTimer() {
    logger.info("Restarting game session timer with " + this.restartTimeBeforeRestart + " seconds left.");
    this.restartTimeBeforeRestart--;
    if (this.restartTimeBeforeRestart <= 0) {
      this.gameManager.autoRestartGameSession();
      clearInterval(this.gameRestart);
    }
  }

  private onAdd(connection: Event, gameRefresh: GameRefreshResponseDTO) {
    const snake = this.game.addSnake(connection.id, (connection.dto as GameAddPlayerDTO).name, (connection.dto as GameAddPlayerDTO).design);
    gameRefresh.entities.snakes.push(snake);
  }

  private onRemove(id: string, gameRefresh: GameRefreshResponseDTO) {
    this.game.removeSnake(id);
    gameRefresh.entities.removed.push(new GameDeadPlayerDTO(id, EntityType.SNAKE, "", EntityType.NOTDEFINED, Death.DECONNEXION));
  }

  public isFinished(): boolean {
    if (this.timeLeft <= 0) {
      return true;
    }
    return false;
  }
}
