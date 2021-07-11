import { BaseError } from "../../../../core/logic/BaseError";

export class DuplicateChildrenError extends BaseError {
  private constructor(duplicateName: string, hierarchy: string) {
    super(`cannot have two groups with the name: ${duplicateName} under hierarchy: ${hierarchy}` )
  }

  static create(duplicateName: string, hierarchy: string) {
    return new DuplicateChildrenError(duplicateName, hierarchy);
  }
}