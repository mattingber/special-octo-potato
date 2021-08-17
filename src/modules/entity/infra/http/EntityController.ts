import { ResponseHandler } from "../../../../shared/infra/http/helpers/ResponseHandler";
import { EntityService } from "../../useCases/EntityService";
import { Response, Request } from "express";
import { AppError } from "../../../../core/logic/AppError";
import { 
  ConnectDigitalIdentityDTO, 
  joiSchema as ConnectDigitalIdentitySchema 
} from '../../useCases/dtos/ConnectDigitalIdentityDTO';
import { 
  CreateEntityDTO, 
  joiSchema as CreateEntitySchema 
} from '../../useCases/dtos/CreateEntityDTO';
import { 
  UpdateEntityDTO, 
  joiSchema as UpdateEntitySchema 
} from '../../useCases/dtos/UpdateEntityDTO';

export class EntityController {
  private _entityService: EntityService;

  constructor(entityService: EntityService) {
    this._entityService = entityService;
  }

  /**
   * POST /entities
   */
  createEntity = async (req: Request, res: Response) => {
    const { error, value } = CreateEntitySchema.validate(req.body);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.createEntity(value as CreateEntityDTO);
    if(result.isErr()) {
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PUT /entities/:id/digitalIdentity/:uniqueId
   */
  connectDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value } = ConnectDigitalIdentitySchema.validate(req.params);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }    
    const result = await this._entityService.connectDigitalIdentity(value as ConnectDigitalIdentityDTO);
    if(result.isErr()) { // TODO: maybe return 404 on not found?
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * DELETE /entities/:id/digitalIdentity/:uniqueId
   */
  disconnectDigitalIdentity = async (req: Request, res: Response) => {
    const { error, value } = ConnectDigitalIdentitySchema.validate(req.params);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }  
    const result = await this._entityService.disconnectDigitalIdentity(value as ConnectDigitalIdentityDTO);
    if(result.isErr()) { // TODO: maybe return 404 on not found?
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PATCH /entities/:id
   */
  updateEntity = async (req: Request, res: Response) => {
    const { error, value } = UpdateEntitySchema.validate({
      ...req.body,
      entityId: req.params.id
    });
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._entityService.updateEntity(value as UpdateEntityDTO);
    if(result.isErr()) {
      if(result.error instanceof AppError.ResourceNotFound) {
        return ResponseHandler.notFound(res, result.error.message);
      } else { // all other errors are 400 validation error
        return ResponseHandler.clientError(res, result.error.message);
      }
    }
    return ResponseHandler.ok(res);
  }

}