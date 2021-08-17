import { GroupService } from "../../useCases/GroupService";
import { Request, Response } from "express";
import {
  CreateGroupDTO,
  joiSchema as CreateGroupSchema
} from '../../useCases/dto/CreateGroupDTO';
import {
  MoveGroupDTO,
  joiSchema as MoveGroupSchema
} from '../../useCases/dto/MoveGroupDTO';
import { ResponseHandler } from "../../../../shared/infra/http/helpers/BaseController";
import { AppError } from "../../../../core/logic/AppError";


export class GroupController {
  constructor(
    private _groupService: GroupService
  ){}

  /**
   * POST /groups
   */
  createGroup = async (req: Request, res: Response) => {
    const { error, value: dto } = CreateGroupSchema.validate(req.body);
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._groupService.createGroup(dto as CreateGroupDTO);
    if(result.isErr()) {
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }

  /**
   * PUT /groups/:id/parent/:parentId
   * @param req 
   * @param res 
   * @returns 
   */
  moveGroup = async (req: Request, res: Response) => {
    const { error, value: dto } = CreateGroupSchema.validate({
      groupId: req.params.id,
      parentId: req.params.parentId,
    });
    if(!!error) {
      return ResponseHandler.clientError(res, error.message);
    }
    const result = await this._groupService.createGroup(dto as CreateGroupDTO);
    if(result.isErr()) {
      const err = result.error;
      if( // only if the group itself is not found return 404
        err instanceof AppError.ResourceNotFound &&
        err.resource === (dto as MoveGroupDTO).groupId
      ) {
        return ResponseHandler.notFound(res, err.message);
      } 
      // else return 400 
      return ResponseHandler.clientError(res, result.error.message);
    }
    return ResponseHandler.ok(res);
  }
}

// TODO: delete route and update route