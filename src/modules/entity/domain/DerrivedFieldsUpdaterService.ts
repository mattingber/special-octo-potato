import { Entity } from "./Entity";
import { DigitalIdentity } from "../../digitalIdentity/domain/DigitalIdentity";
import { Role } from "../../Role/domain/Role";
import { Hierarchy } from "../../../shared/Hierarchy";

export class DerrivedFieldsUpdaterService {
  constructor() {

  }
  private isPrimaryDigitalIdentity(entity: Entity, digitalIdentity: DigitalIdentity) {
    return entity.akaUnit === digitalIdentity.source; // TODO: implement the real condition
  }
  public update_entity_derrived_fields_when_primary(
    entity: Entity,
    connectedDigitalIdentity: DigitalIdentity,
    connectedRole: Role
  ) {
    if (
      !connectedDigitalIdentity.connectedEntityId?.equals(entity.entityId) ||
      !connectedRole.digitalIdentityUniqueId?.equals(connectedDigitalIdentity.uniqueId)
    ) {
      /**
       * DI not Connected to Entity or Role not Connected to DI 
       * should return error so calling service will log it
       */
      return;
    }
    if (this.isPrimaryDigitalIdentity(entity, connectedDigitalIdentity)) {
      entity.setHierarchy(Hierarchy.create(connectedRole.hierarchy));
      // set other fields
    }
  }
  /* 
  happens on:
    - Role connecting / disconneting to DI
    - DI connecting / disconneting to Entity
    - Group moving to new Parent 
    - Role moving to new parent group
  (Entity , DI, Role) =>
    if DI is primary of Entity {
      entity.hierarchy = Role.hierarchy
      entity.X = Role.X
    }
  */
}