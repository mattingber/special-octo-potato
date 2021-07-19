import { Model } from "mongoose";
import { DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { DigitalIdentityDoc } from './DigitalIdentityModel';
import { DigitalIdentity } from '../../domain/DigitalIdentity';
import { DigitalIdentityMapper as Mapper } from './DigitalIdentityMapper';
import { DigitalIdentityId } from '../../domain/DigitalIdentityId';
import { EntityId } from "../../../entity/domain/EntityId";
import { Outbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";


export class DigitalIdentityRepository implements IdigitalIdentityRepo {

  constructor (
    private _model: Model<DigitalIdentityDoc>,
    private _outbox: Outbox,
  ) {}

  async save(digitalIdentity: DigitalIdentity): Promise<void> {
    const persistanceState = Mapper.toPersistance(digitalIdentity);
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      await this._model.updateOne(
        { uniqueId: persistanceState.uniqueId }, 
        persistanceState, 
        { upsert: true }
      ).session(session);
      await this._outbox.put(digitalIdentity.domainEvents, session);
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