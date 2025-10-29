import { Direction } from "@/Direction";

export const GameConfig = {
  GAME_TICKRATE_MS: 10,
  GAME_SPEED_MS: 50,

  GRID_COLS: 24,
  GRID_ROWS: 24,

  SNAKE_SPAWNING_LENGTH: 3,
  SNAKE_SPAWNING_DIRECTION: Direction.DOWN,

  BONUS_PROBABILITY_SPAWN_APPLE: 0.01,
}
