import { Request, Response } from "express";
import { AppError } from "../../../../core/logic/AppError";
import { ResponseHandler } from "../../../../shared/infra/http/helpers/BaseController";
import { DigitalIdentityService } from "../../useCases/DigitalIdentityService";
import {
  CreateDigitalIdentityDTO,
  joiSchema as CreateDigitalIdentitySchema
} from "../../useCases/dtos/CreateDigitalIdentityDTO"
import {
  UpdateDigitalIdentityDTO,
  joiSchema as UpdateDigitalIdentitySchema
} from "../../useCases/dtos/UpdateDigitalIdentityDTO";

export class DigitalIdentityController {
  constructor(
    private _diService: DigitalIdentityService
  ){}

  /**
   * POST /digitalIdentities
   */
  createDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = CreateDigitalIdentitySchema.validate(req.body);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._diService.createDigitalIdentity(dto as CreateDigitalIdentityDTO);
    if(result.isErr()) {
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PATCH /digitalIdentities/:id
   */
  updateDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value: dto } = UpdateDigitalIdentitySchema.validate({
      ...req.body,
      uniqueId: req.params.id,
    });
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._diService.updateDigitalIdentity(dto as UpdateDigitalIdentityDTO);
    if(result.isErr()) {
      if(result.error instanceof AppError.ResourceNotFound) {
        return ResponseHandler.notFound(res, result.error.message)
      } else {
        return ResponseHandler.clientError(res, result.error.message);
      }
    }
    return ResponseHandler.ok(res);
  }
}
// TODO route for delete