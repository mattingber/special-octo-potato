import { BaseError } from "./BaseError";

export namespace AppError {
  export class UnexpectedError extends BaseError {
    private err?: any

    private constructor (err?: any) {
      super('unexpected error occured');
      this.err = err
    }

    get error() {
      return this.err;
    }

    static create(err?: any) {
      return new UnexpectedError(err);
    }
  }

  export class CannotUpdateFieldError extends BaseError {
    private constructor(fieldName: string) {
      super(`cannot update field: ${fieldName}`);
    }

    static create(fieldName: string) {
      return new CannotUpdateFieldError(fieldName);
    }
  }
}