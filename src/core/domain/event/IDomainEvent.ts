import { UniqueEntityId } from "../UniqueEntityId";

export interface IDomainEvent {
  readonly occuredOn: Date;
  readonly aggregateId: UniqueEntityId;
  toPlainObject(): object;
}