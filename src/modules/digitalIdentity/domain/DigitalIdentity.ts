import { CannotConnectAlreadyConnected } from './errors/CannotConnectAlreadyConnected ';
import { CannotDisconnectUnconnected } from './errors/CannotDisconnectUnconnected';
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
    this.markModified();
  }

  updateMail(mail: Mail) {
    this._mail = mail;
    this.markModified();
  }

  connectToEntity(entity: Entity) {

    if(this._entityId) {
      return err(CannotConnectAlreadyConnected.create(this.uniqueId.toString()));
    }
    this._entityId = entity.entityId;
    this.markModified();
  }

  disconnectEntity() {
    // if (this.type === DigitalIdentityType.Kaki) {
    //   return; // TODO: is error?
    // }
    if(!this._entityId) {
      return err(CannotDisconnectUnconnected.create(this.uniqueId.toString()));
    }
    this._entityId = undefined;
    this.markModified();
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
    return DigitalIdentityId.create(this.id.toString())._unsafeUnwrap();
  }
  get connectedEntityId() {
    return this._entityId;
  }

}