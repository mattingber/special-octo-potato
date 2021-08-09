import { Schema, Model, model, Types } from "mongoose";
import { EntityType, Sex } from "../../domain/Entity";

export interface EntityDoc {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  entityType: EntityType;
  displayName?: string;
  personalNumber?: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string;
  clearance?: number; // value object
  mail?: string; //value object
  sex?: Sex;
  serviceType?: string; //value object
  dischargeDate?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: string[]; //value object
  mobilePhone?: string[]; //value object
  goalUserId?: string;
  primaryDigitalIdentityId?: string;
}

const schema = new Schema<EntityDoc, Model<EntityDoc>, EntityDoc> ({
  firstName: String,
  lastName: String,
  entityType: String,
  displayName: String,
  personalNumber: String, // use value object
  identityCard: String,
  rank: String, //use vale object / enum
  akaUnit: String,
  clearance: Number, // value object
  mail: String, //value object
  sex: String,
  serviceType: String, //value object
  dischargeDate: Date,
  birthDate: Date,
  jobTitle: String,
  address: String, // value
  phone: [String], //value object
  mobilePhone: [String], //value object
  goalUserId: String,
  primaryDigitalIdentityId: String,
},{
  versionKey: false,
  timestamps: true,
});

export default schema;
