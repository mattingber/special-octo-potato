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

// ensure name is unique under the same parent group
// schema.index({ name: 1 }); 
// schema.index({ source: 1 })
// schema.index({ directGroup: 1 })
// schema.index({ akaUnit: 1 })
// schema.index({ status: 1 })

export default schema;
