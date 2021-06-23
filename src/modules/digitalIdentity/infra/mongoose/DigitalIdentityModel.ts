import { Schema, Model, Types, model } from 'mongoose';

export interface DigitalIdentityDoc {
  uniqueId: string;
  type: string;
  source: string; // enum?
  mail: string; // use value Object
  canConnectRole?: boolean;
  entityId?: Types.ObjectId; // object Id 
}

const schema = new Schema<DigitalIdentityDoc, Model<DigitalIdentityDoc>, DigitalIdentityDoc> ({
  uniqueId: { type: String, unique: true, required: true },
  entityId: { type: Schema.Types.ObjectId, ref: () => 'Entity' }, // todo: model names provider?
  type: String,
  source: String,
  mail: String,
  canConnectRole: Boolean,
},{
  _id: false,
  versionKey: false,
  timestamps: true,
});

const di_model = model('DigitalIdentity', schema); // todo: model names provider?

export default di_model;
