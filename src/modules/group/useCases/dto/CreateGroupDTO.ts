import Joi from 'joi';

export type CreateGroupDTO = {
  name: string;
  source: string;
  parentId?: string;
  akaUnit?: string;
}

export const joiSchema = Joi.object({
  name: Joi.string().required(),
  source: Joi.string().required(),
  parentId: Joi.string(),
  akaUnit: Joi.string(),
});

