import { Model, Types, FilterQuery, Connection } from "mongoose";
import { EntityRepository as IEntityRepository, IhaveEntityIdentifiers, EntityIdentifier } from "../../repository/EntityRepository"
import { EntityMapper as Mapper} from "./EntityMapper";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { default as EntitySchema, EntityDoc } from "./EntitySchema";
import { EntityId } from "../../domain/EntityId";
import { Entity } from "../../domain/Entity";
import { PersonalNumber } from "../../domain/PersonalNumber";
import { IdentityCard } from "../../domain/IdentityCard";
import { err, ok, Result } from "neverthrow";
import { AggregateVersionError } from "../../../../core/infra/AggregateVersionError";

export class EntityRepository implements IEntityRepository {
  private _model: Model<EntityDoc>;
  private _eventOutbox: EventOutbox

  constructor(db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
    const { modelName } = config;
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, EntitySchema);
    }
    this._eventOutbox = eventOutbox;
  }

  async exists(identifier: EntityIdentifier): Promise<boolean> {
    let identifierName: 'personalNumber' | 'identityCard' | 'goalUserId';
    if(identifier instanceof PersonalNumber) { identifierName = 'personalNumber'; }
    else if(identifier instanceof IdentityCard) { identifierName = 'identityCard'; }
    else { identifierName = 'goalUserId'; }
    const res = await this._model.findOne({ [identifierName]: identifier.toString() }).lean().select('_id');
    return !!res;
  }

  generateEntityId(): EntityId {
    return EntityId.create(new Types.ObjectId().toHexString());
  }
  
  async getByEntityId(entityId: EntityId): Promise<Entity | null> {
    const raw = await this._model.findOne({ _id: entityId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async save(entity: Entity): Promise<Result<void, AggregateVersionError>> {
    const persistanceState = Mapper.toPersistance(entity);
    const session = await this._model.startSession();
    let result: Result<void, AggregateVersionError> = ok(undefined);
    await session.withTransaction(async () => {
      if(!!await this._model.findOne({ _id: entity.entityId.toString() }).session(session)) {
        const updateOp = await this._model.updateOne(
          { 
            _id: entity.entityId.toString(), 
            version: entity.fetchedVersion,
          },
          persistanceState
        ).session(session);
        if(updateOp.n === 0) {
          result = err(AggregateVersionError.create(entity.fetchedVersion))
        }
      } else {
        await this._model.create([persistanceState], { session });
        result = ok(undefined);
      }
      await this._eventOutbox.put(entity.domainEvents, session);
    });
    session.endSession();
    return result;
  }
}
