import { BaseController } from "../../../../shared/infra/http/helpers/BaseController";
import { EntityService } from "../../useCases/EntityService";
import { Response, Request } from "express";

export class EntityController extends BaseController {
  private _entityService: EntityService;

  constructor(entityService: EntityService) {
    super();
    this._entityService = entityService;
  }

  /**
   * 
   */
  async createEntity(req: Request, res: Response) {
    
  }
}