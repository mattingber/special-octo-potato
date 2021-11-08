import { UniqueEntityId } from "../../../core/domain/UniqueEntityId";

export class RoleId extends UniqueEntityId {
  private constructor(id: string) {
    super(id.toLowerCase());
  }

  private static format(id: string) {
    return id.trim();
  }

  public static create(id: string) {
    return new RoleId(RoleId.format(id));
  }
}
