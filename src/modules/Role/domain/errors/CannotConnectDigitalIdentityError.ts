import { BaseError } from "../../../../core/logic/BaseError";

export class CannotConnectDigitalIdentityError extends BaseError {
  private constructor(roleId: string, diUniqueId: string) {
    super(`cannot connect role: ${roleId} to Digital Identity: ${diUniqueId}`)
  }

  static create(roleId: string, diUniqueId: string) {
    return new CannotConnectDigitalIdentityError(roleId, diUniqueId);
  }
}