import { Schema, Model, model } from "mongoose";

export interface RoleDoc {
  roleId: string;
  source: string;
  jobTitle?: string;
  hierarchyIds: string[];
  directGroup: string;
  hierarchy: string;
  digitalIdentityUniqueId?: string;
}

const schema = new Schema<RoleDoc, Model<RoleDoc>, RoleDoc> ({
  roleId: { type: String, unique: true, required: true },
  digitalIdentityUniqueId: { 
    type: String, 
    ref: () => 'DigitalIdentity', // TODO: model names provider?
  }, 
  source: String,
  hierarchyIds: [String],
  directGroup: String,
  hierarchy: String,
  jobTitle: String,
},{
  versionKey: false,
  timestamps: true,
});

export default model('Role', schema); // TODO: model names provider?
