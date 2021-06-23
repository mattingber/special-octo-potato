import { Model } from 'mongoose';
import {DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { DigitalIdentityDoc } from './DigitalIdentityModel';
import { DigitalIdentity } from '../../domain/DigitalIdentity';
import { DigitalIdentityMapper as Mapper } from './DigitalIdentityMapper';
import { DigitalIdentityId } from '../../domain/DigitalIdentityId';

export class DigitalIdentityRepository implements IdigitalIdentityRepo {

  constructor (
    private _model: Model<DigitalIdentityDoc>
  ) {}

  async save(digitalIdentity: DigitalIdentity): Promise<void> {
    const persistanceState = Mapper.toPersistance(digitalIdentity);
    await this._model.updateOne(
      { uniqueId: persistanceState.uniqueId }, 
      persistanceState, 
      { upsert: true }
    );
  }

  async getByUniqueId(uniqueId: DigitalIdentityId) {
    const y = await this._model.findOne({ uniqueId: uniqueId.toString() })
  }

}