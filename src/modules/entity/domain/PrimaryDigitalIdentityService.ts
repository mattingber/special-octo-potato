import { Entity } from "./Entity";
import { DigitalIdentity, DigitalIdentityType } from "../../digitalIdentity/domain/DigitalIdentity";
import { Role } from "../../Role/domain/Role";
import { Source } from "../../digitalIdentity/domain/Source";
import { Mail } from "../../digitalIdentity/domain/Mail";
import { EntityId } from "./EntityId";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import config from "config";


export type DigitalIdentityObject = {
  type: DigitalIdentityType;
  source: Source;
  mail?: Mail; // use value Object
  connectedEntityId: EntityId;
  canConnectRole?: boolean;
  uniqueId: DigitalIdentityId;
};


// TODO: inject config in another way
const STRONG_SOURCES: string[] = config.get('valueObjects.source.strongSources'); 
const PRIMARY_MAP: object = config.get('valueObjects.source.primaryMap');

export class PrimaryDigitalIdentityService { // TODO: should be "static" class
  private _primarySourceMap: Map<string, Source>;

  constructor() {
    // TODO: Caution: it may throw an error if the sources values does not match the source values in config

    // create "Source" instances frpm the strings in the config object and put then in
    // a ES6 Map
    this._primarySourceMap = new Map(Object.entries(PRIMARY_MAP)
      .map(([key, source]) => [key, Source.create(source as string)._unsafeUnwrap()]));
  }

  private static haveStrongSource(digitalIdentity: DigitalIdentityObject) {
    return STRONG_SOURCES.includes(digitalIdentity.source.value);
  }

  private havePrimarySource(entity: Entity, digitalIdentity: DigitalIdentityObject) {
    return !!entity.akaUnit ? 
      digitalIdentity.source.value === this._primarySourceMap.get(entity.akaUnit)?.value :
      false;
  }

  // public setEntityPrimaryDigitalIdentity(
  //   entity: Entity,
  //   connectedDigitalIdentity: DigitalIdentity,
  // ) {
  //   if (
  //     !connectedDigitalIdentity.connectedEntityId?.equals(entity.entityId) ||
  //     !connectedRole.digitalIdentityUniqueId?.equals(connectedDigitalIdentity.uniqueId)
  //   ) {
  //     /**
  //      * DI not Connected to Entity or Role not Connected to DI 
  //      * should return error so calling service will log it
  //      */
  //     return;
  //   }
  //   if (this.havePrimarySource(entity, connectedDigitalIdentity)) {
  //     entity.setHierarchy(Hierarchy.create(connectedRole.hierarchy));
  //     // set other fields
  //   }
  // }

  public choosePrimaryDigitalIdentity(entity: Entity, digitalIdentities: DigitalIdentityObject[]) {
    const connected = digitalIdentities.filter(di => di.connectedEntityId.equals(entity.entityId));
    // no connected DIs, set primary to undefined
    if(connected.length === 0) {
      entity.updateDetails({ primaryDigitalIdentityId: undefined });
      return;
    }
    // check if current primary has the strongest source
    let currentPrimary = connected.find(di => di.uniqueId.equals(entity.primaryDigitalIdentityId));
    if( 
      !!currentPrimary && 
      PrimaryDigitalIdentityService.haveStrongSource(currentPrimary)
    ) {
      return;
    }
    // find if one of the other DIs has the strongest source
    const strongSourceDI = connected.find(PrimaryDigitalIdentityService.haveStrongSource);
    if(!!strongSourceDI) {
      entity.updateDetails({ primaryDigitalIdentityId: strongSourceDI.connectedEntityId });
      return;
    }
    // check for primary source DI (and the current primary has not)
    const primarySourceDI = connected.find(di => this.havePrimarySource(entity, di));
    if(
      (!currentPrimary || !this.havePrimarySource(entity, currentPrimary)) &&
      !!primarySourceDI
    ) {
      entity.updateDetails({ primaryDigitalIdentityId: primarySourceDI.connectedEntityId });
      return;
    }
    // connect one of the DIs
    if(!currentPrimary) {
      entity.updateDetails({ primaryDigitalIdentityId: connected[0].connectedEntityId });
      return;
    }
    // else, the current primary
   
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