export interface EntityServer {
  id: string;
  name: string;
  boxes: [number,number][];
}

export interface EntitiesRefresh{
  snakes : EntityServer[],
  apples : EntityServer[],
  removed : string[]
}

export interface EntitiesUpdate{
  snakes : EntityServer[],
  apples : EntityServer[],
}

export function EntitiesRefreshLoader(entities: any) : EntitiesRefresh{
  return {
    snakes: EntitiesLoader(entities.snakes),
    apples: EntitiesLoader(entities.apple),
    removed: entities.removed
  }
}

export function EntitiesUpdateLoader(entities: any) : EntitiesUpdate{
  return {
    snakes: EntitiesLoader(entities.snakes),
    apples: EntitiesLoader(entities.apple),
  }
}

function EntitiesLoader(entities: any) : EntityServer[]{
  if (entities){
    return (entities as any[]).map((entity: EntityServer) => EntityLoader(entity));
  }
  return [];
}

function EntityLoader(entity: any): EntityServer {
  return { id: entity.id, boxes: entity.cases, name: entity.name } as EntityServer
} 
