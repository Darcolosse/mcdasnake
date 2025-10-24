export interface DTO {
  type: string;
}

export const DTOType = {
  GameUpdate: 'GameUpdate',
  GameAddPlayer: 'GameAddPlayer',
  GameRemovePlayer: 'GameRemovePlayer',
  GameUpdateSnakeDirection: 'GameUpdateSnakeDirection',
}