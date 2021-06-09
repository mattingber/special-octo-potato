import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { DigitalIdentityId } from "./DigitalIdentityId";
import { RoleId } from "../../Role/domain/RoleId";

export enum DigitalIdentityType {
  DomainUser = 'domainUser',
  Kaki = 'kaki'
}

interface DigitalIdentityProps {
  type: DigitalIdentityType; // use enum
  source: string;
  mail: string; // use value Object
  // uniqueId: string;
  entityId?: string
  canConnectRole?: boolean;
  connectedRoleId?: RoleId;
}


export class DigitalIdentity extends AggregateRoot {

  private _type: DigitalIdentityType;
  private _mail: string;
  private _source: string;
  // private _uniqueId: string
  private _canConnectRole: boolean;
  private _entityId: string | null; // use value object EntityId

  private constructor(id: DigitalIdentityId, props: DigitalIdentityProps) {
    super(id);
    this._type = props.type;
    this._source = props.source;
    this._mail = props.mail;
    this._canConnectRole = props.canConnectRole || true;
    this._entityId = props.entityId || null;
  }

  disableRoleConnectable() {
    this._canConnectRole = false;
  }

  connectToEntity(entityId: string) {
    // todo: implement
  }

  disconnectEntity() {

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