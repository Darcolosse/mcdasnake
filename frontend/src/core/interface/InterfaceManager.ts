import type { Ref } from "vue";
import type { GameManager } from "../GameManager";
import type { GameUpdateResponseDTO } from "../network/dto/responses/GameUpdateResponse";
import type { GameRefreshDTO } from "../network/dto/responses/GameRefresh";
import type { GameDeadPlayerResponseDTO } from "../network/dto/responses/GamePlayerDead";

export class InterfaceManager {
  private gameManager!: GameManager
  private scoreBoard: Ref<Array<[string, number, number, number]> | null>
  private respawnAuthorization: Ref<Boolean>
  private lastDeathMessageRef: Ref<string>
  private timerRef: Ref<string>
  private targetDate: Date
  private gameRunningRef: Ref<Boolean> 

  constructor(respawnAuthorization: Ref<Boolean>, lastDeathMessageRef: Ref<string> , scoreBoard: Ref<Array<[string, number, number, number]> | null>, timerRef: Ref<string>, gameRunningRef: Ref<Boolean>)  {
    this.respawnAuthorization = respawnAuthorization
    this.lastDeathMessageRef = lastDeathMessageRef
    this.scoreBoard = scoreBoard
    this.targetDate = new Date(Date.now())
    this.timerRef = timerRef
    this.gameRunningRef = gameRunningRef

    // Default
    this.respawnAuthorization.value = false
    this.gameRunningRef.value = false
    
    setInterval(this.updateTimer.bind(this), 1000)
  }

  // ====================== Vertical layer ======================= \\

  public setGameManager(gameManager: GameManager) {
    this.gameManager = gameManager
  }

  public setTimerEnd(dto: GameUpdateResponseDTO) {
    this.targetDate = dto.dateEndGame
    this.updateTimer()
  }

  public permitToRespawn(dto: GameDeadPlayerResponseDTO) {
    this.lastDeathMessageRef.value = dto.deathMessage
    this.respawnAuthorization.value = true
  }

  public restrictRespawn() {
    this.respawnAuthorization.value = false
  }

  public askForRespawn() {
    if (this.respawnAuthorization.value) {
      this.gameManager.askServerForRespawn()
    }
  }

  public setEntireScoreboard(dto: GameUpdateResponseDTO) {
    this.scoreBoard.value = dto.scoreBoard
  }

  public updateScoreboard(dto: GameRefreshDTO) {
    this.scoreBoard.value = dto.scoreBoard
  }

  private updateTimer() {
    const now = Date.now()

    if(!this.targetDate || !this.timerRef || this.targetDate.getTime() < now) return

    const diff = this.targetDate.getTime() - now
  
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
  
    if(minutes == 0 && seconds == 0) {
      this.timerRef.value = "Time's up!"
      this.gameManager.suspend()
    } else {
      this.timerRef.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
  }

  public onEndGame() {

  }

  public onGameRestart() {

  }
}
