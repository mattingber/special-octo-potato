import { Connection, Model } from "mongoose";
import { DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { default as DigitalIdentitySchema, DigitalIdentityDoc } from './DigitalIdentitySchema';
import { DigitalIdentity } from '../../domain/DigitalIdentity';
import { DigitalIdentityMapper as Mapper } from './DigitalIdentityMapper';
import { DigitalIdentityId } from '../../domain/DigitalIdentityId';
import { EntityId } from "../../../entity/domain/EntityId";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";
import { Mail } from "../../domain/Mail";
import { err, ok, Result } from "neverthrow";
import { AggregateVersionError } from "../../../../core/infra/AggregateVersionError";

export class DigitalIdentityRepository implements IdigitalIdentityRepo {
  private _model: Model<DigitalIdentityDoc>;
  private _eventOutbox: EventOutbox;

  constructor (db: Connection, eventOutbox: EventOutbox, config: { modelName: string }) {
    const { modelName } = config;
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
  
  async save(digitalIdentity: DigitalIdentity): Promise<Result<
    void, 
    AggregateVersionError>
  > {
    const persistanceState = Mapper.toPersistance(digitalIdentity);
    const session = await this._model.startSession();
    let result: Result<void, AggregateVersionError> = ok(undefined);
    await session.withTransaction(async () => {
      const exists = !! await this._model.findOne({ 
        uniqueId: digitalIdentity.uniqueId.toString()
      }).session(session);
      if(exists) {
        const updateOp = await this._model.updateOne(
          { 
            uniqueId: digitalIdentity.uniqueId.toString(), 
            version: digitalIdentity.fetchedVersion,
          },
          persistanceState
        ).session(session);
        if(updateOp.n === 0) {
          result = err(AggregateVersionError.create(digitalIdentity.fetchedVersion))
        }
      } else {
        await this._model.create([persistanceState], { session });
        result = ok(undefined);
      }
      await this._eventOutbox.put(digitalIdentity.domainEvents, session);
    });
    session.endSession();
    return result;
  }

  async getByUniqueId(uniqueId: DigitalIdentityId) {
    const raw = await this._model.findOne({ uniqueId: uniqueId.toString() }).lean();
    if(!raw) return null;
    return Mapper.toDomain(raw);
  }

  async getByEntityId(entityId: EntityId) {
    const raw = await this._model.find({ entityId: entityId.toString() }).lean();
    return raw.map(Mapper.toDomain);
  }

}