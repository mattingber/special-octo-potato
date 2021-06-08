import { UniqueEntityId } from "../../../core/domain/UniqueEntityId";

export class RoleId extends UniqueEntityId {
  private constructor(id: string) {
    super(id);
  }

  public static create(id: string) {
    return new RoleId(id);
  }
}
