import { EntityBase } from "./EntityBase";
import { IDomainEvent } from "./event/IDomainEvent";
import { UniqueEntityId } from "./UniqueEntityId";

export abstract class AggregateRoot extends EntityBase {
  private _domainEvents: IDomainEvent[] = [];
  private _version: number;
  private _savedVersion: number;

  constructor(id: UniqueEntityId, opts: CreateOpts) {
    super(id);
    if(opts.isNew) {
      this._version = 0;
    } else {
      this._version = opts.savedVersion; // TODO: mybe throw if savedVersion is < 0
    }
    this._savedVersion = this._version;
  }

  protected addDomainEvent(event: IDomainEvent) {
    this._domainEvents.push(event);
  }

  protected markModified() {
    if(this._savedVersion === this._version) {
      this._version++;
    }
  }

  get domainEvents() {
    return [...this._domainEvents];
  }

  get version() {
    return this._version;
  }

  get fetchedVersion() {
    return this._savedVersion;
  }

}

export type CreateOpts = {
  isNew: true;
} | {
  isNew: false;
  savedVersion: number;
} 