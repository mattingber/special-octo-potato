import { Schema, Model, model, Types } from "mongoose";

export interface RoleDoc {
  roleId: string;
  source: string;
  jobTitle?: string;
  directGroup: Types.ObjectId;
  digitalIdentityUniqueId?: string;
  // hierarchyIds: string[];
  // hierarchy: string;
}

const schema = new Schema<RoleDoc, Model<RoleDoc>, RoleDoc> ({
  roleId: { type: String, unique: true, required: true },
  digitalIdentityUniqueId: { 
    type: String, 
    ref: () => 'DigitalIdentity', // TODO: model names provider?
  }, 
  source: String,
  directGroup: Schema.Types.ObjectId,
  jobTitle: String,
},{
  versionKey: false,
  timestamps: true,
});

export default model('Role', schema); // TODO: model names provider?
