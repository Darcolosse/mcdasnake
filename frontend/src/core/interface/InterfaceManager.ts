import type { Ref } from "vue";
import type { GameManager } from "../GameManager";

export class InterfaceManager {
  private gameManager!: GameManager;
  private respawnAuthorization: Ref<Boolean>;

  constructor(respawnAuthorization: Ref<Boolean>)  {
    this.respawnAuthorization = respawnAuthorization

    // Default
    this.respawnAuthorization.value = false
  }

  // ====================== Vertical layer ======================= \\

  public setGameManager(gameManager: GameManager) {
    this.gameManager = gameManager
  }

  public permitToRespawn() {
    this.respawnAuthorization.value = true
  }

  public restrictRespawn() {
    this.respawnAuthorization.value = false
  }

  public askForRespawn() {
    if (this.respawnAuthorization) {
      this.gameManager.askServerForRespawn()
    }
  }
}
