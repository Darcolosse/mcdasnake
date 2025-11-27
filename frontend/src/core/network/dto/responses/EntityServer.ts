import type { GameDeadPlayerResponseDTO } from "./GamePlayerDead";

export interface EntityServer {
  id: string;
  name: string;
  boxes: [number,number][];
  design: string;
}

export interface EntitiesRefresh{
  snakes : EntityServer[],
  apples : EntityServer[],
  removed : GameDeadPlayerResponseDTO[]
}

export interface EntitiesUpdate{
  snakes : EntityServer[],
  apples : EntityServer[],
}

export function EntitiesRefreshLoader(entities: any) : EntitiesRefresh{
  return {
    snakes: EntitiesLoader(entities.snakes),
    apples: EntitiesLoader(entities.apples),
    removed: entities.removed
  }
}

export function EntitiesUpdateLoader(entities: any) : EntitiesUpdate{
  return {
    snakes: EntitiesLoader(entities.snakes),
    apples: EntitiesLoader(entities.apples),
  }
}

function EntitiesLoader(entities: any) : EntityServer[]{
  if (entities){
    return (entities as any[]).map((entity: EntityServer) => EntityLoader(entity));
  }
  return [];
}

function EntityLoader(entity: any): EntityServer {
  return { id: entity.id, boxes: entity.positions, name: entity.name, design: entity.design, } as EntityServer
} 
