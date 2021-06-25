import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { DigitalIdentityId } from "./DigitalIdentityId";
import { EntityId } from "../../entity/domain/EntityId";
import { Entity } from "../../entity/domain/Entity";

export enum DigitalIdentityType {
  DomainUser = 'domainUser',
  Kaki = 'kaki'
}

interface DigitalIdentityState {
  type: DigitalIdentityType;
  source: string; // enum?
  mail: string; // use value Object
  entityId?: EntityId;
  canConnectRole?: boolean;
}

export class DigitalIdentity extends AggregateRoot {

  private _type: DigitalIdentityType;
  private _mail: string;
  private _source: string;
  private _canConnectRole: boolean;
  private _entityId?: EntityId; 

  private constructor(id: DigitalIdentityId, props: DigitalIdentityState) {
    super(id);
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

  connectToEntity(entity: Entity) {
    this._entityId = entity.entityId
  }

  disconnectEntity() {
    if (this.type === DigitalIdentityType.Kaki) {
      return; //error??
    }
    this._entityId = undefined;
  }

  static _create(id: DigitalIdentityId, state: DigitalIdentityState, opts: CreateOpts) {
    if (state.type === DigitalIdentityType.Kaki && state.canConnectRole) {
      return new DigitalIdentity(id, state); //error
    }
    return new DigitalIdentity(id, state);
  }
  
  static createDomainUser(uniqueId: DigitalIdentityId, props: Omit<DigitalIdentityState, 'type'>) {
    return DigitalIdentity._create(
      uniqueId,
      { ...props, type: DigitalIdentityType.DomainUser },
      { isNew: true },
    );
  }
    
  // maybe need an Entity to create a 'kaki' DI
  static createKaki(
    uniqueId: DigitalIdentityId,
    connectedEntity: Entity,
    props: Omit<DigitalIdentityState, 'type' | 'canConnectRole' | 'entityId'>
  ) {
    return DigitalIdentity._create(
      uniqueId,
      {
        ...props,
        entityId: connectedEntity.entityId,
        type: DigitalIdentityType.Kaki,
      },
      { isNew: true },
    )
  }

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
    return DigitalIdentityId.create(this.id.toValue());
  }
  get connectedEntityId() {
    return this._entityId;
  }

}