import Joi from 'joi';

export type ConnectDigitalIdentityDTO = {
  entityId: string;
  digitalIdentityUniqueId: string;
}

export const joiSchema = Joi.object({
  entityId: Joi.string().required(),
  digitalIdentityUniqueId: Joi.string().required(),
});
