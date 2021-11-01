import { Schema, Model, model, Types } from "mongoose";

export interface EntityDoc {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  entityType: string;
  displayName?: string;
  personalNumber?: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string;
  clearance?: string; // value object
  mail?: string; //value object
  sex?: string;
  serviceType?: string; //value object
  dischargeDay?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: string[]; //value object
  mobilePhone?: string[]; //value object
  goalUserId?: string;
  primaryDigitalIdentityId?: string;
  pictures?: {
    profile?: {
      path: string;
      meta: {
        format: string;
        createdAt: Date;
        updatedAt?: Date;
      };
    };
  };
  version: number;
}

const schema = new Schema<EntityDoc, Model<EntityDoc>, EntityDoc>(
  {
    firstName: String,
    lastName: String,
    entityType: String,
    displayName: String,
    personalNumber: String, // use value object
    identityCard: String,
    rank: String, //use vale object / enum
    akaUnit: String,
    clearance: String, // value object
    mail: String, //value object
    sex: String,
    serviceType: String, //value object
    dischargeDay: Date,
    birthDate: Date,
    jobTitle: String,
    address: String, // value
    phone: [String], //value object
    mobilePhone: [String], //value object
    goalUserId: String,
    primaryDigitalIdentityId: String,
    pictures: {
      profile: {
        path: String,
        meta: {
          format: String,
          createdAt: Date,
          updatedAt: Date,
        },
      },
    },
    version: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// schema.index({ personalNumber: 1 })
// schema.index({ identityCard: 1 })
// schema.index({ goalUserId: 1 })
// schema.index({ entityType: 1 })

export default schema;
