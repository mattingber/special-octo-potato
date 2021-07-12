import { EntityBase } from "./EntityBase";
import { EntityId } from "../../modules/entity/domain/EntityId";
import { IDomainEvent } from "./event/IDomainEvent";

export abstract class AggregateRoot extends EntityBase {
  private _domainEvents: IDomainEvent[] = [];

  protected addDomainEvent(event: IDomainEvent) {
    this._domainEvents.push(event);
  }

  get domainEvents() {
    return [...this._domainEvents];
  }

}

export type CreateOpts = {
  isNew: boolean;
}