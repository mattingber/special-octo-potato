import { IDomainEvent } from "./IDomainEvent";

export interface IEventHandler<T extends IDomainEvent> {
  setupSubscriptions(): void;
  handle(domainEvent: T): void;
}