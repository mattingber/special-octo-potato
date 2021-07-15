import { IDomainEvent } from "../../../../core/domain/event/IDomainEvent";
import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
import { DigitalIdentityType } from "../DigitalIdentity";
import { DigitalIdentityId } from "../DigitalIdentityId";
import { EntityId } from "../../../entity/domain/EntityId";

type DIEventPayload = {
  uniqueId: DigitalIdentityId;
  source: string;
  mail: string;
  type: DigitalIdentityType;
  disconnectedEntityId: EntityId;
}

export class DigitalIdentityDisconnectedEvent extends DomainEvent<DIEventPayload> {
 
  toPlainObject(): object {
    const {
      source,
      mail,
      type,
      disconnectedEntityId,
      uniqueId,
    } = this.payload;
    return {
      source,
      mail,
      type,
      connectedEntityId: disconnectedEntityId.toString(),
      uniqueId: uniqueId.toString(),
    };
  }

  get mail() {
    return this.payload.mail;
  }
  get source() {
    return this.payload.source;
  }
  get type() {
    return this.payload.type;
  }
  get disconnectedEntityId() {
    return this.payload.disconnectedEntityId;
  }
  get uniqueId() {
    return this.payload.uniqueId;
  }
}
