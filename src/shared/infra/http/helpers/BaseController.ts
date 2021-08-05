import { Response } from "express";

export abstract class BaseController {

  protected ok<T>(res: Response, dto?: T) {
    if(!!dto) {
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  protected jsonResponse(res: Response, code: number, message: string) {
    return res.status(code).json({ message });
  }

  protected clientError(res: Response, message?: string) {
    return this.jsonResponse(res, 400, message || 'Bad Request');
  }

  protected notFound(res: Response, message?: string) {
    return this.jsonResponse(res, 404, message || 'Not found');
  }

  protected conflict(res: Response, message?: string) {
    return this.jsonResponse(res, 409, message || 'Conflict');
  }

  protected forbidden(res: Response, message?: string) {
    return this.jsonResponse(res, 403, message || 'Forbidden');
  }
}