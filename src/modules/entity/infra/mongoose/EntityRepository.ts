import { Model, Types } from "mongoose";
import { EntityRepository as IEntityRepository } from "../../repository/EntityRepository"
import { EntityMapper as Mapper} from "./EntityMapper";
import { Outbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { EntityDoc } from "./entityModel";
import { EntityId } from "../../domain/EntityId";
import { Entity } from "../../domain/Entity";

export class EntityRepository implements IEntityRepository {

  constructor(
    private _model: Model<EntityDoc>,
    private _outbox: Outbox
  ) {}

  generateEntityId(): EntityId {
    return  EntityId.create(new Types.ObjectId().toHexString());
  }
  
  async getByEntityId(entityId: EntityId): Promise<Entity | null> {
    const raw = await this._model.findOne({ _id: entityId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async save(entity: Entity) {
    const persistanceState = Mapper.toPersistance(entity);
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      await this._model.updateOne(
        { _id: entity.entityId.toString() }, 
        persistanceState, 
        { upsert: true }
      ).session(session);
      await this._outbox.put(entity.domainEvents, session);
    });
    session.endSession();
  }
}
