import { UniqueEntityId } from "../../../core/domain/UniqueEntityId";

export class DigitalIdentityId extends UniqueEntityId {
  private constructor(id: string) {
    super(id);
  }

  public static create(id: string) {
    return new DigitalIdentityId(id);
  }
}
