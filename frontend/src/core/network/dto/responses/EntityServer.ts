export type EntityType = "SNAKE" | "APPLE" | "ENTITY"

export interface EntityServer {
  id: number;
  boxes: [[number,number]];
  type: EntityType
}

export function EntityLoader(entity: any): EntityServer {
  return { id: entity.id, boxes: entity.boxes, type: entity.type } as EntityServer
} 
