import { Schema, Model, Types, model } from 'mongoose';
import { DigitalIdentityType } from '../../domain/DigitalIdentity';

export interface DigitalIdentityDoc {
  uniqueId: string;
  type: DigitalIdentityType;
  source: string; // enum?
  mail: string; // use value Object
  isRoleAttachable?: boolean;
  entityId?: Types.ObjectId; // object Id 
}

const schema = new Schema<DigitalIdentityDoc, Model<DigitalIdentityDoc>, DigitalIdentityDoc> ({
  uniqueId: { type: String, unique: true, required: true },
  entityId: { type: Schema.Types.ObjectId, ref: () => 'Entity' }, // todo: model names provider?
  type: { 
    type: String,
    enum: [ DigitalIdentityType.DomainUser, DigitalIdentityType.Kaki ],
  },
  source: String,
  mail: String,
  isRoleAttachable: Boolean,
},{
  _id: false,
  versionKey: false,
  timestamps: true,
});

const di_model = model('DigitalIdentity', schema); // todo: model names provider?

export default di_model;
