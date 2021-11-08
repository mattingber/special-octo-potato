import Joi from 'joi';

export type PatchGroupDTO = {
  id: string;
  diPrefix: string;
}

export const joiSchema = Joi.object({
  id: Joi.string().required(),
  diPrefix: Joi.string().required(),
});

