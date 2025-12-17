export interface DTO {
  type: string;
}

export const DTOType = {
  GameUpdate: 'GameUpdate',
  AddPlayer: 'AddPlayer',
  RemovePlayer: 'RemovePlayer',
  SnakeTurn: 'SnakeTurn',
  GameRefresh: 'GameRefresh',
  GameDeadPlayer: 'GameDeadPlayer',
  GamePing: 'GamePing',
}
