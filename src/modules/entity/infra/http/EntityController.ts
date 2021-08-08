import { ControllerHelper } from "../../../../shared/infra/http/helpers/BaseController";
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
  async createEntity(req: Request, res: Response) {
    const { error, value } = CreateEntitySchema.validate(req.body);
    if(!!error) {
      return ControllerHelper.clientError(res, error.message);
    }
    const result = await this._entityService.createEntity(value as CreateEntityDTO);
    if(result.isErr()) {
      return ControllerHelper.clientError(res, result.error.message);
    }
    return ControllerHelper.ok(res);
  }

  /**
   * PUT /entities/:id/digitalIdentity/:uniqueId
   */
  async connectDigitalIdentity(req: Request, res: Response) {
    const { error, value } = ConnectDigitalIdentitySchema.validate(req.params);
    if(!!error) {
      return ControllerHelper.clientError(res, error.message);
    }    
    const result = await this._entityService.connectDigitalIdentity(value as ConnectDigitalIdentityDTO);
    if(result.isErr()) { // TODO: maybe return 404 on not found?
      return ControllerHelper.clientError(res, result.error.message);
    }
    return ControllerHelper.ok(res);
  }

  /**
   * DELETE /entities/:id/digitalIdentity/:uniqueId
   */
  async disconnectDigitalIdentity(req: Request, res: Response) {
    const { error, value } = ConnectDigitalIdentitySchema.validate(req.params);
    if(!!error) {
      return ControllerHelper.clientError(res, error.message);
    }  
    const result = await this._entityService.disconnectDigitalIdentity(value as ConnectDigitalIdentityDTO);
    if(result.isErr()) { // TODO: maybe return 404 on not found?
      return ControllerHelper.clientError(res, result.error.message);
    }
    return ControllerHelper.ok(res);
  }

  /**
   * PATCH /entities/:id
   */
  async updateEntity(req: Request, res: Response) {
    const { error, value } = UpdateEntitySchema.validate({
      ...req.body,
      entityId: req.params.id
    });
    if(!!error) {
      return ControllerHelper.clientError(res, error.message);
    }
    const result = await this._entityService.updateEntity(value as UpdateEntityDTO);
    if(result.isErr()) {
      if(result.error instanceof AppError.ResourceNotFound) {
        return ControllerHelper.notFound(res, result.error.message);
      } else { // all other errors are 400 validation error
        return ControllerHelper.clientError(res, result.error.message);
      }
    }
    return ControllerHelper.ok(res);
  }

}