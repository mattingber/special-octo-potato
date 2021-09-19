import { Schema, Model, Types, model } from 'mongoose';
import { DigitalIdentityType } from '../../domain/DigitalIdentity';

export interface DigitalIdentityDoc {
  uniqueId: string;
  type: DigitalIdentityType;
  source: string; // enum?
  mail?: string; 
  isRoleAttachable?: boolean;
  entityId?: Types.ObjectId;
  version: number;
}

const schema = new Schema<DigitalIdentityDoc, Model<DigitalIdentityDoc>, DigitalIdentityDoc> ({
  uniqueId: { type: String, unique: true, required: true },
  entityId: { type: Schema.Types.ObjectId, ref: () => 'Entity' }, // TODO: model names provider?
  type: { 
    type: String,
    enum: [ DigitalIdentityType.DomainUser, DigitalIdentityType.VirtualUser ],
  },
  source: String,
  mail: String,
  isRoleAttachable: Boolean,
  version: Number,
},{
  versionKey: false,
  timestamps: true,
});

export default schema;
