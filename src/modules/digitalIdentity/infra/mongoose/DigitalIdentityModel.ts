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
  // todo: unique id
  type: String,
  source: String,
  mail: String,
  canConnectRole: String,
  entityId: Schema.Types.ObjectId,
});

const di_model = model<DigitalIdentityDoc>('DigitalIdentity', schema);

export default di_model;
