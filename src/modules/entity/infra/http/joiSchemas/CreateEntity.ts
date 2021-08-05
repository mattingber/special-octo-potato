import Joi from 'joi';

export default Joi.object({
  firstName: Joi.string().min(1).required(),
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
  // date field
})
// firstName: string;
//   entityType: string;
//   lastName?: string;
//   personalNumber?: string;
//   identityCard?: string;
//   rank?: string;
//   akaUnit?: string;
//   clearance?: number;
//   mail?: string;
//   sex?: string;
//   serviceType?: string; 
//   dischargeDate?: Date;
//   birthDate?: Date;
//   jobTitle?: string;
//   address?: string; // value?
//   phone?: string[]; //value object
//   mobilePhone?: string[]; //value object
//   goalUserId?: string;

