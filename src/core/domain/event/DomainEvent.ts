import { IDomainEvent } from "./IDomainEvent";
import { UniqueEntityId } from "../UniqueEntityId";

export abstract class DomainEvent<T> implements IDomainEvent {
  readonly occuredOn: Date;
  readonly aggregateId: UniqueEntityId;
  readonly eventName: string;
  protected payload: T;

  constructor(aggregateId: UniqueEntityId, payload: T & { occuredOn?: Date }) {
    this.eventName = this.constructor.name;
    const { occuredOn, ...rest } = payload;
    this.occuredOn = occuredOn || new Date();
    this.aggregateId = aggregateId;
    this.payload = rest as T;
  }

  abstract toPlainObject(): object;
}