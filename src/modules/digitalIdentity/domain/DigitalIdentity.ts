import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { DigitalIdentityId } from "./DigitalIdentityId";
import { EntityId } from "../../entity/domain/EntityId";
import { Entity } from "../../entity/domain/Entity";
import { Result, err, ok } from "neverthrow";
import { CannotConnectRoleError } from "./errors/CannotConnectRoleError";
import { Mail } from "./Mail";
import { Source } from "./Source";
import { DigitalIdentityConnectedEvent } from "./events/DigitalIdentityConnectedEvent";
import { DigitalIdentityDisconnectedEvent } from "./events/DigitalIdentityDisconnectedEvent";
import { isSomeEnum } from "../../../utils/isSomeEnum";

export enum DigitalIdentityType {
  DomainUser = 'domainUser',
  Kaki = 'kaki'
}
const isDiType = isSomeEnum(DigitalIdentityType);
export const castToDigitalIdentityType = (val: string): Result<DigitalIdentityType, string> => {
  if(isDiType(val)) { return ok(val); }
  return err(`${val} is invalid Digital Identity type`);
}

interface DigitalIdentityState {
  type: DigitalIdentityType;
  source: Source;
  mail?: Mail; // use value Object
  entityId?: EntityId;
  canConnectRole?: boolean;
}

export class DigitalIdentity extends AggregateRoot {

  private _type: DigitalIdentityType;
  private _mail?: Mail;
  private _source: Source;
  private _canConnectRole: boolean;
  private _entityId?: EntityId; 

  private constructor(id: DigitalIdentityId, props: DigitalIdentityState, opts: CreateOpts) {
    super(id, opts);
    this._type = props.type;
    this._source = props.source;
    this._mail = props.mail;
    this._entityId = props.entityId;
    this._canConnectRole = props.canConnectRole !== undefined 
      // if given in props - use it  
      ? props.canConnectRole 
      // else default to true if it is a domainUser type
      : this._type === DigitalIdentityType.DomainUser; 
  }

  disableRoleConnectable() {
    this._canConnectRole = false;
  }

  updateMail(mail: Mail) {
    this._mail = mail;
  }

  connectToEntity(entity: Entity) {
    // if currently connected - emmit disconnected event

    // if(!!this._entityId) {
    //   this.addDomainEvent(new DigitalIdentityDisconnectedEvent(this.id, {
    //     disconnectedEntityId: this._entityId,
    //     source: this._source,
    //     type: this._type,
    //     uniqueId: this.uniqueId,
    //     mail: this._mail,
    //   }));
    // }
    
    this.addDomainEvent(new DigitalIdentityConnectedEvent(this.id, {
      canConnectRole: this._canConnectRole,
      mail: this._mail,
      source: this._source,
      type: this._type,
      uniqueId: this.uniqueId,
      connectedEntityId: entity.entityId,
    }));
    this._entityId = entity.entityId
  }

  disconnectEntity() {
    if (this.type === DigitalIdentityType.Kaki) {
      return; // TODO: is error?
    }
    if(!!this._entityId) {
      this.addDomainEvent(new DigitalIdentityDisconnectedEvent(this.id, {
        mail: this._mail,
        source: this._source,
        type: this._type,
        uniqueId: this.uniqueId,
        disconnectedEntityId: this._entityId,
      }));
    }
    this._entityId = undefined;
  }

  static create(
    id: DigitalIdentityId, 
    state: DigitalIdentityState, 
    opts: CreateOpts
  ): Result<DigitalIdentity, CannotConnectRoleError> {
    if (state.type === DigitalIdentityType.Kaki && state.canConnectRole) {
      return err(CannotConnectRoleError.create(id.toString())); //error
    }
    // TODO: 
    return ok(new DigitalIdentity(id, state, opts));
  }
  
  // static createDomainUser(uniqueId: DigitalIdentityId, props: Omit<DigitalIdentityState, 'type'>) {
  //   return DigitalIdentity._create(
  //     uniqueId,
  //     { ...props, type: DigitalIdentityType.DomainUser },
  //     { isNew: true },
  //   );
  // }
    
  // maybe need an Entity to create a 'kaki' DI
  // static createKaki(
  //   uniqueId: DigitalIdentityId,
  //   connectedEntity: Entity,
  //   props: Omit<DigitalIdentityState, 'type' | 'canConnectRole' | 'entityId'>
  // ) {
  //   return DigitalIdentity._create(
  //     uniqueId,
  //     {
  //       ...props,
  //       entityId: connectedEntity.entityId,
  //       type: DigitalIdentityType.Kaki,
  //     },
  //     { isNew: true },
  //   )
  // }

  get type() {
    return this._type;
  }
  get source() {
    return this._source;
  }
  get mail() {
    return this._mail;
  }
  get canConnectRole() {
    return this._canConnectRole;
  }
  get uniqueId() {
    return DigitalIdentityId.create(this.id.toValue())._unsafeUnwrap();
  }
  get connectedEntityId() {
    return this._entityId;
  }

}