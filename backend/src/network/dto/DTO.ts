export interface DTO {
  type: string;
}

export const DTOType = {
  GameUpdate: 'GameUpdate',
  AddPlayer: 'AddPlayer',
  RemovePlayer: 'RemovePlayer',
  SnakeTurn: 'SnakeTurn',
  GameRefresh: 'GameRefresh',
  GameScoreBoard: 'GameScoreBoard',
  GameDeadPlayer: 'GameDeadPlayer',
  GamePing: 'GamePing',
}
