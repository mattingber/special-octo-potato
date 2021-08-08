import Joi from 'joi';

export type UpdateEntityDTO = { entityId: string } & Partial<{
  firstName: string;
  entityType: string;
  lastName: string;
  personalNumber: string;
  identityCard: string;
  rank: string;
  akaUnit: string;
  clearance: number;
  sex: string;
  serviceType: string; 
  dischargeDate: Date;
  birthDate: Date;
  address: string; // value?
  phone: string[]; //value object
  mobilePhone: string[]; //value object
  goalUserId: string;
}>

export const joiSchema = Joi.object({
  entityId: Joi.string().required(),
  firstName: Joi.string().min(1),
  entityType: Joi.string(),
  lastName: Joi.string(),
  personalNumber: Joi.number(),
  identityCard: Joi.number(),
  rank: Joi.string(),
  akaUnit: Joi.string(),
  clearance: Joi.number().integer().positive(),
  sex: Joi.string(),
  serviceType: Joi.string(),
  address: Joi.string(),
  phone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  mobilePhone: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  goalUserId: Joi.string(),
  jobTitle: Joi.string(),
  dischargeDate: Joi.date(),
  birthDate: Joi.date(),
});