import { Connection, Model } from "mongoose";
import { DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { default as DigitalIdentitySchema, DigitalIdentityDoc } from './DigitalIdentitySchema';
import { DigitalIdentity } from '../../domain/DigitalIdentity';
import { DigitalIdentityMapper as Mapper } from './DigitalIdentityMapper';
import { DigitalIdentityId } from '../../domain/DigitalIdentityId';
import { EntityId } from "../../../entity/domain/EntityId";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { Mail } from "../../domain/Mail";

const modelName = 'DigitalIdentity'; // TODO: get from config
export class DigitalIdentityRepository implements IdigitalIdentityRepo {
  private _model: Model<DigitalIdentityDoc>;
  private _eventOutbox: EventOutbox;

  constructor (db: Connection, eventOutbox: EventOutbox) {
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, DigitalIdentitySchema);
    }
    this._eventOutbox = eventOutbox;    
  }

  async exists(identifier: Mail | DigitalIdentityId) {
    if(identifier instanceof Mail) {
      return !!(await this._model.findOne({ mail: identifier.value }).lean());
    } else { // is DigitalIdentityId
      return !!(await this._model.findOne({ uniqueId: identifier.toString() }).lean());
    }
  }
  
  async save(digitalIdentity: DigitalIdentity): Promise<void> {
    const persistanceState = Mapper.toPersistance(digitalIdentity);
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      await this._model.updateOne(
        { uniqueId: persistanceState.uniqueId }, 
        persistanceState, 
        { upsert: true }
      ).session(session);
      await this._eventOutbox.put(digitalIdentity.domainEvents, session);
    });
    session.endSession();
  }

  async getByUniqueId(uniqueId: DigitalIdentityId) {
    const raw = await this._model.findOne({ uniqueId: uniqueId.toString() }).lean();
    if(!raw) return null;
    return Mapper.toDomain(raw);
  }

  async getByEntityId(entityId: EntityId) {
    const raw = await this._model.findOne({ entityId: entityId.toString() }).lean();
    if(!raw) return null;
    return Mapper.toDomain(raw);
  }

}