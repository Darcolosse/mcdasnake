export interface DTO {
  type: string;
}

export const DTOType = {
  GameUpdate: 'GameUpdate',
  GameRefresh: 'GameRefresh',
  Turn: 'SnakeTurn',
  AddPlayer: 'AddPlayer',
  RemovePlayer: 'RemovePlayer',
}
