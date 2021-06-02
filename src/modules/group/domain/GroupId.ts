import { UniqueEntityId } from "../../../shared/domain/UniqueEntityId";

export class GroupId extends UniqueEntityId {
  constructor(id: string) {
    super(id);
  }
}
