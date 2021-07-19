import { Repository } from "../../../core/infra/Repository";
import { Entity } from "../domain/Entity";
import { EntityId } from "../domain/EntityId";

export interface EntityRepository extends Repository<Entity> {
  save(entity: Entity): Promise<void>;
  getByEntityId(enityId: EntityId): Promise<Entity | null>;
  generateEntityId(): EntityId;
}
