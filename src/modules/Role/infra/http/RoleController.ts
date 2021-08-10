import { Request, Response } from "express";
import { RoleService } from "../../useCases/RoleService";
import { 
  ConnectDigitalIdentityDTO,
  joiSchema as ConnectDigitalIdentitySchema
} from "../../useCases/dtos/ConnectDigitalIdentityDTO";
import { 
  CreateRoleDTO,
  joiSchema as CreateRoleSchema
} from "../../useCases/dtos/CreateRoleDTO";
import { 
  MoveGroupDTO,
  joiSchema as MoveGroupSchema
} from "../../useCases/dtos/MoveGroupDTO";
import { 
  UpdateRoleDTO,
  joiSchema as UpdateRoleSchema
} from "../../useCases/dtos/UpdateRoleDTO";
import { ResponseHandler } from "../../../../shared/infra/http/helpers/BaseController";
import { AppError } from "../../../../core/logic/AppError";

export class RoleController {
  constructor(
    private _roleService: RoleService
  ){}

  async createRole(req: Request, res: Response) {
    const { error, value: dto } = CreateRoleSchema.validate(req.body);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._roleService.createRole(dto as CreateRoleDTO);
    if(result.isErr()) {
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PUT /roles/:roleId/group/:groupId
   * @param req 
   * @param res 
   * @returns 
   */
  async moveGroup(req: Request, res: Response) {
    const { error, value: dto } = MoveGroupSchema.validate(req.params)
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._roleService.moveToGroup(dto as MoveGroupDTO);
    if(result.isErr()) {
      const err = result.error;
      // only if the role itself is not found return 404
      if(err.resource === (dto as MoveGroupDTO).roleId) {
        return ResponseHandler.notFound(res, err.message);
      } 
      // else return 400 
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PUT /roles/:roleId/digitalIdentity/:digitalIdentityUniqueId
   * @param req 
   * @param res 
   * @returns 
   */
  async connectDigitalIdentity(req: Request, res: Response) {
    const { error, value: dto } = ConnectDigitalIdentitySchema.validate(req.params)
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._roleService.connectDigitalIdentity(dto as ConnectDigitalIdentityDTO);
    if(result.isErr()) {
      const err = result.error;
      // only if the role itself is not found return 404
      if(
        err instanceof AppError.ResourceNotFound &&
        err.resource === (dto as ConnectDigitalIdentityDTO).roleId
      ) {
        return ResponseHandler.notFound(res, err.message);
      } 
      // else return 400 
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PATCH /roles/:roleId
   * @param req 
   * @param res 
   * @returns 
   */
  async updateRole(req: Request, res: Response) {
    const { error, value: dto } = UpdateRoleSchema.validate({
      roleId: req.params.roleId,
      ...req.body,
    });
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._roleService.updateRole(dto as UpdateRoleDTO);
    if(result.isErr()) {
      const err = result.error;
      // only if the role itself is not found return 404
      if(
        err instanceof AppError.ResourceNotFound &&
        err.resource === (dto as ConnectDigitalIdentityDTO).roleId
      ) {
        return ResponseHandler.notFound(res, err.message);
      } 
      // else return 400 
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  // TODO: implement delete route

}