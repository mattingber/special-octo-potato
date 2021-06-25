import { Schema, Model, model } from "mongoose";

export interface RoleDoc {
  roleId: string;
  source: string;
  jobTitle?: string;
  hierarchyIds: string[];
  hierarchy: string;
  digitalIdentityUniqueId?: string;
}

const schema = new Schema<RoleDoc, Model<RoleDoc>, RoleDoc> ({
  roleId: { type: String, unique: true, required: true },
  digitalIdentityUniqueId: { 
    type: String, 
    ref: () => 'DigitalIdentity', // todo: model names provider?
  }, 
  source: String,
  hierarchyIds: [String],
  hierarchy: String,
  jobTitle: String,
},{
  _id: false,
  versionKey: false,
  timestamps: true,
});

export default model('Role', schema); // todo: model names provider?
