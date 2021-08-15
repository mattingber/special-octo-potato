import { Schema, Model, model, Types } from "mongoose";

export interface GroupDoc {
  _id: Types.ObjectId;
  source: string;
  name: string;
  // ancestors: Types.ObjectId[];
  // hierarchy: string;
  directGroup?: Types.ObjectId;
  status?: string;
  akaUnit?: string;
  version: number;
}

const schema = new Schema<GroupDoc, Model<GroupDoc>, GroupDoc> ({
  name: String,
  source: String,
  // hierarchy: String,
  status: String,
  akaUnit: String,
  // ancestors: [Schema.Types.ObjectId],
  directGroup: Schema.Types.ObjectId,
  version: Number,
},{
  versionKey: false,
  timestamps: true,
});

schema.index({ hierarchy: 1, name: 1 }, { unique: true });

export default schema;
