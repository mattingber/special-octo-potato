import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { EntityId } from "./EntityId";
import { Hierarchy } from "../../../shared/Hierarchy";

enum EntityType {
  Soldier = 'soldier',
  Civilian = 'civilian',
  GoalUser = 'goalUser'
}

type CommonEntityProps = {
  entityType: EntityType;
  hierarchy?: Hierarchy;
  clearance: number;
}

type PersonProps = {
  firstName: string;
  lastName: string
}

type GoalUserEntityProps = CommonEntityProps & {
  firstName: string;
}

type SoldierEntityProps = CommonEntityProps & PersonProps & {
  personalNumber: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string
}

type CivilianEntityProps = CommonEntityProps & PersonProps & {
  identityCard: string;
  personalNumber?: string;
}

interface EntityProps {
  firstName: string;
  lastName?: string;
  entityType: EntityType;
  hierarchy?: Hierarchy;
  personalNumber?: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string;
  clearance: number; // value object
}

export class Entity extends AggregateRoot {
  private _firstName: string;
  private _lastName: string;
  private _entityType: EntityType;
  private _hierarchy?: Hierarchy;
  private _rank?: string;
  private _identityCard?: string; 
  private _personalNumber?: string;
  private _akaUnit?: string;
  private _clearance: number;

  private constructor(id: EntityId, props: EntityProps) {
    super(id);
    this._firstName = props.firstName;
    this._lastName = props.lastName || '';
    this._entityType = props.entityType;
    this._hierarchy = props.hierarchy;
    this._rank = props.rank;
    this._identityCard = props.identityCard;
    this._personalNumber = props.personalNumber;
    this._akaUnit = props.akaUnit;
    this._clearance = props.clearance;
  }

  public setIdentityCard(identityCard: string) {
    if (this._entityType === EntityType.GoalUser) {
      return; //error
    }
    if (!!this._identityCard) {
      return; // error
    }
    this._identityCard = identityCard;
  }

  public setPersonalNumber(personalNumber: string) {
    if (this._entityType === EntityType.GoalUser) {
      return; //error
    }
    if (!!this._personalNumber) {
      return; // error
    }
    this._personalNumber = personalNumber;
  }

  public setHierarchy(hierarchy: Hierarchy) {
    this._hierarchy = hierarchy;
  }

  private static isValidSoldierProps(props: EntityProps): props is SoldierEntityProps {
    const { entityType, personalNumber } = props;
    return Entity.isValidPerson(props) 
      && entityType === EntityType.Soldier 
      && !!personalNumber;
  }

  private static isValidCivilianProps(props: EntityProps): props is CivilianEntityProps {
    const { identityCard, entityType } = props;
    return Entity.isValidPerson(props) 
      && entityType === EntityType.Civilian 
      && !!identityCard;
  }

  private static isValidPerson(props: EntityProps) {
    const { entityType, firstName, lastName } = props;
    return (entityType === EntityType.Civilian || entityType === EntityType.Soldier)
      && !!firstName && !!lastName;
  }

  private static createSoldier(id: EntityId, props: SoldierEntityProps) {
    return new Entity(id, props);
  }

  private static createCivilian(id: EntityId, props: CivilianEntityProps) {
    return new Entity(id, props);
  }

  static create(id: EntityId, props: EntityProps) {
    let entity: Entity | null = null;
    switch(props.entityType) {
      case EntityType.Soldier: 
        if (Entity.isValidSoldierProps(props)) {
          entity = Entity.createSoldier(id, props);
        }
        break;
      case EntityType.Civilian: 
        if (Entity.isValidCivilianProps(props)) {
          entity = Entity.createCivilian(id, props);
        }
        break;
      default:
        entity = null
    }
    if (!!entity) {
      return entity;
    }
  }

  get entityId() {
    return EntityId.create(this.id.toValue());
  }

  get name() {
    return {
      firstName: this._firstName,
      lastName: this._lastName
    }
  }
  get entityType() {
    return this._entityType;
  }
  get personalNumber() {
    return this._personalNumber;
  }
  get identityCard() {
    return this._identityCard;
  }
  get rank() {
    return this._rank;
  }
  get akaUnit() {
    return this._akaUnit;
  }
  get hierarchy() {
    return this._hierarchy;
  }
  get clearance() {
    return this._clearance;
  }

}
