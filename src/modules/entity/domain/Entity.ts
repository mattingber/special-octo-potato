import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { EntityId } from "./EntityId";
import { Hierarchy } from "../../../shared/Hierarchy";

enum EntityType {
  Soldier = 'soldier',
  Civilian = 'civilian',
  GoalUser = 'goalUser'
}

enum Sex {
  Male = 'male',
  Female = 'female'
}

// interface EntityState {
//   firstName: string;
//   lastName?: string;
//   entityType: EntityType;
//   hierarchy?: Hierarchy;
//   personalNumber?: string; // use value object
//   identityCard?: string;
//   rank?: string; //use vale object / enum
//   akaUnit?: string;
//   clearance: number; // value object
//   mail?: string; //value object
//   sex?: Sex;
//   serviceType?: string; //value object
//   dischargeDate?: Date;
//   birthDate?: Date;
//   jobTitle?: string;
//   address?: string; // value?
// }


type CommonEntityProps = {
  firstName: string;
  entityType: EntityType;
  hierarchy?: Hierarchy;
  clearance: number;
  mail?: string; //value object, should be required??
  jobTitle?: string;
}

type PersonProps = {
  firstName: string;
  lastName: string;
  sex: Sex;
  address?: string;
  dischargeDate?: Date;
  birthDate?: Date;
  serviceType: string; //value object
}

type GoalUserEntityProps = CommonEntityProps

type SoldierEntityProps = {
  personalNumber: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string
}

type CivilianEntityProps = {
  identityCard: string;
  personalNumber?: string;
}

type EntityState = CommonEntityProps & 
  Partial<PersonProps> & 
  Partial<CivilianEntityProps> & 
  Partial<SoldierEntityProps>

type CreateSoldierProps = CommonEntityProps & PersonProps & SoldierEntityProps;
type CreateCivilianProps = CommonEntityProps & PersonProps & CivilianEntityProps;


// type yy =SoldierEntityProps & CivilianEntityProps

// const s: yy = {

// }



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
  private _mail?: string;
  private _sex?: Sex;
  private _serviceType?: string; //value object
  private _dischargeDate?: Date;
  private _birthDate?: Date;
  private _jobTitle?: string;
  private _address?: string; // value?

  private constructor(id: EntityId, props: EntityState) {
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
    this._sex = props.sex;
    this. _serviceType = props.serviceType;
    this. _dischargeDate = props.dischargeDate;
    this. _birthDate = props.birthDate;
    this. _jobTitle = props.jobTitle;
    this. _address = props.address;
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

  private static isValidSoldierProps(props: EntityState): props is CreateSoldierProps {
    const { entityType, personalNumber } = props;
    return Entity.isValidPerson(props) 
      && entityType === EntityType.Soldier 
      && !!personalNumber;
  }

  private static isValidCivilianProps(props: EntityState): props is CreateCivilianProps {
    const { identityCard, entityType } = props;
    return Entity.isValidPerson(props) 
      && entityType === EntityType.Civilian 
      && !!identityCard;
  }

  private static isValidPerson(props: EntityState) {
    const { entityType, firstName, lastName } = props;
    return (entityType === EntityType.Civilian || entityType === EntityType.Soldier)
      && !!firstName && !!lastName;
  }

  private static createSoldier(id: EntityId, props: CreateSoldierProps) {
    return new Entity(id, props);
  }

  private static createCivilian(id: EntityId, props: CreateCivilianProps) {
    return new Entity(id, props);
  }

  static create(id: EntityId, props: EntityState) {
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
  // todo: add more getters

}
