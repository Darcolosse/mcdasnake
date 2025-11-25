import type { GameManager } from "../GameManager";

export const Sounds = {
  APPLE: "./sounds/apple.mp3",
  GAME_START: "./sounds/start_game.mp3",
}

export type Sounds = typeof Sounds[keyof typeof Sounds]

export class SoundManager {

  private readonly gameManager: GameManager;
  private readonly audioInstances : Map<Sounds, HTMLAudioElement>;
  private readonly antiDuplicateSounds : Map<Sounds, number>;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager

    this.gameManager.log(this, "Loading sounds")
    this.audioInstances = new Map();
    this.antiDuplicateSounds = new Map();
    Object.entries(Sounds).forEach(([key , url]) => {
      this.audioInstances.set(key, new Audio(url))
      this.antiDuplicateSounds.set(key, performance.timeOrigin)
    })
    this.gameManager.log(this, "Loaded sounds")
  }

  public play(sound: Sounds) {
    const audio = this.audioInstances.get(sound)
    const lastTimePlayed = this.antiDuplicateSounds.get(sound)
    if(!audio || !lastTimePlayed) return

    const now = performance.now()
    const tooSoon = (now - lastTimePlayed) < audio?.duration 
    if(tooSoon) return

    this.antiDuplicateSounds.set(sound, now)
    audio.currentTime = 0
    audio.play()
  }

}
