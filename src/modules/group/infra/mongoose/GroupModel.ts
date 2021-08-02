import { Schema, Model, model, Types } from "mongoose";

export interface GroupDoc {
  _id: Types.ObjectId;
  source: string;
  name: string;
  // ancestors: Types.ObjectId[];
  // hierarchy: string;
  directGroup?: Types.ObjectId;
  childrenNames: string[];
  status?: string;
  akaUnit?: string;
}

const schema = new Schema<GroupDoc, Model<GroupDoc>, GroupDoc> ({
  name: String,
  source: String,
  // hierarchy: String,
  status: String,
  akaUnit: String,
  childrenNames: [String],
  // ancestors: [Schema.Types.ObjectId],
  directGroup: Schema.Types.ObjectId,
},{
  versionKey: false,
  timestamps: true,
});

schema.index({ hierarchy: 1, name: 1 }, { unique: true });

export default model('Role', schema); // TODO: model names provider?
