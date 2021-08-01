import { Model, Types, FilterQuery } from "mongoose";
import { EntityRepository as IEntityRepository, IhaveEntityIdentifiers, EntityIdentifier } from "../../repository/EntityRepository"
import { EntityMapper as Mapper} from "./EntityMapper";
import { Outbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { EntityDoc } from "./entityModel";
import { EntityId } from "../../domain/EntityId";
import { Entity } from "../../domain/Entity";
import { PersonalNumber } from "../../domain/PersonalNumber";
import { IdentityCard } from "../../domain/IdentityCard";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { has } from "../../../../utils/ObjectUtils";

export class EntityRepository implements IEntityRepository {

  constructor(
    private _model: Model<EntityDoc>,
    private _outbox: Outbox
  ) {}

  async exists(identifier: EntityIdentifier): Promise<boolean> {
    let identifierName: 'personalNumber' | 'identityCard' | 'goalUserId';
    if(identifier instanceof PersonalNumber) { identifierName = 'personalNumber'; }
    else if(identifier instanceof IdentityCard) { identifierName = 'identityCard'; }
    else { identifierName = 'goalUserId'; }
    const res = await this._model.findOne({ [identifierName]: identifier.toString() }).lean().select('_id');
    return !!res;
  }

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
