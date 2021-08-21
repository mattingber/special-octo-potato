import { Response } from "express";
import { AppError } from "../../../../core/logic/AppError";
import { BaseError } from "../../../../core/logic/BaseError";
import { ResponseHandler } from "./ResponseHandler";


type DefaultHandlerOpts = {
  notFoundOnlyWhenResourceMatch?: string;
}

export abstract class ErrorResponseHandler {
  /**
   * Handle common error results:
   * 
   * RetryableConflictError -> 409 conflict
   * 
   * ResourceNotFound Error -> 404 Not Found
   * 
   * UnexpectedError -> 500 Unexpected
   * 
   * all other errors -> 400 Bad Request
   * @param res 
   * @param err 
   * @returns 
   */
  static defaultErrorHandler(res: Response, err: BaseError, opts: DefaultHandlerOpts = {}) {
    if(err instanceof AppError.RetryableConflictError) {
      return ResponseHandler.conflict(res);
    } else if (err instanceof AppError.ResourceNotFound) {
      if(
        !opts.notFoundOnlyWhenResourceMatch ||
        (!!opts.notFoundOnlyWhenResourceMatch &&
        err.resource === opts.notFoundOnlyWhenResourceMatch)
      ) {
        return ResponseHandler.notFound(res, err.message);
      }
    } else if (err instanceof AppError.UnexpectedError) {
      return ResponseHandler.fail(res, err.message);
    }
    // the default is client error
    return ResponseHandler.clientError(res, err.message);
  }
}