import { Model } from 'mongoose';
import {DigitalIdentityRepository as IdigitalIdentityRepo } from '../../repository/DigitalIdentityRepository';
import { DigitalIdentityDoc } from './DigitalIdentityModel';
import { DigitalIdentity } from '../../domain/DigitalIdentity';

export class DigitalIdentityRepository implements IdigitalIdentityRepo {

  constructor (
    private _model: Model<DigitalIdentityDoc>
  ) {}

  async save(digitalIdentity: DigitalIdentity): Promise<void> {
    this._model.updateOne()
  }

}