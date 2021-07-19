import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { EntityId } from "./EntityId";
import { Hierarchy } from "../../../shared/Hierarchy";
import { has } from "../../../utils/ObjectUtils";
import { Result, err, ok } from "neverthrow";
import { IllegalEntityStateError } from "./errors/IllegalEntityStateError";
import { AppError } from "../../../core/logic/AppError";
import { CannotChangeEntityTypeError } from "./errors/CannotChangeEntityTypeError";

export enum EntityType {
  Soldier = 'soldier',
  Civilian = 'civilian',
  GoalUser = 'goalUser'
}

export enum Sex {
  Male = 'male',
  Female = 'female'
}

// todo: add displayName

type CommonEntityProps = {
  firstName: string;
  entityType: EntityType;
  hierarchy?: Hierarchy;
  clearance?: number; // value object
  mail?: string; //value object, should be required??
  jobTitle?: string;
}

type PersonProps = {
  firstName: string;
  lastName: string;
  clearance: number;
  sex?: Sex;
  address?: string;
  dischargeDate?: Date;
  birthDate?: Date;
  serviceType: string; //value object
  phone?: Set<string>; //value object
  mobilePhone?: Set<string>; //value object
}

type GoalUserEntityProps = CommonEntityProps & {
  goalUserId: string;
}

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

// type EntityState = CommonEntityProps & 
//   Partial<PersonProps> & 
//   Partial<CivilianEntityProps> & 
//   Partial<SoldierEntityProps>

type CreateSoldierProps = CommonEntityProps & PersonProps & SoldierEntityProps;
type CreateCivilianProps = CommonEntityProps & PersonProps & CivilianEntityProps;

type EntityState = {
  firstName: string;
  lastName?: string;
  entityType: EntityType;
  hierarchy?: Hierarchy;
  displayName?: string;
  personalNumber?: string; // use value object
  identityCard?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string;
  clearance?: number; // value object
  mail?: string; //value object
  sex?: Sex;
  serviceType?: string; //value object
  dischargeDate?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: Set<string>; //value object
  mobilePhone?: Set<string>; //value object
  goalUserId?: string;
}

type CommonState = Pick<EntityState, 'firstName' | 'entityType' | 'hierarchy' | 'clearance' | 'mail' | 'jobTitle'>;

const REQUIRED_COMMON_FIELDS: (keyof EntityState)[] = ['firstName', 'entityType'];

// type PersonState = 
//   CommonState &
//   Required<Pick<EntityState, 'lastName' | 'serviceType'>> &
//   Pick<EntityState, 'sex' | 'address' | 'dischargeDate' | 'birthDate' | 'phone' | 'mobilePhone'>;

const REQUIRED_PERSON_FIELDS: (keyof EntityState)[] = ['firstName', 'lastName', 'serviceType'];

// type SoldierState = 
//   PersonState & 
//   Required<Pick<EntityState, 'personalNumber'>> & 
//   Pick<EntityState, 'rank' | 'identityCard' | 'akaUnit'>;

// type CivilianState = 
//   PersonState & 
//   Required<Pick<EntityState, 'identityCard'>> &  
//   Pick<EntityState, 'personalNumber' | 'rank'>;

  
const ENTITY_TYPE_VALID_STATE: {
[k in EntityType]: {
  required: (keyof EntityState)[],
  forbidden: (keyof EntityState)[],
}
} = {
  [EntityType.Civilian]: {
    required: [...REQUIRED_PERSON_FIELDS, 'identityCard'],
    forbidden: ['goalUserId'],
  },
  [EntityType.Soldier]: {
    required: [...REQUIRED_PERSON_FIELDS, 'personalNumber'],
    forbidden: ['goalUserId'],
  },
  [EntityType.GoalUser]: {
    required: ['firstName', 'goalUserId'],
    forbidden: ['identityCard', 'rank', 'serviceType', 'sex', 'address', 'dischargeDate', 'birthDate'],
  },
};

const SET_ONLY_ONCE_FIELDS = new Set(['sex', 'identityCard', 'personalNumber', 'birthDate'] as (keyof EntityState)[]);

type UpdateDto = Partial<Omit<EntityState, 'hierarchy' | 'displayName'>>;
type UpdateResult = Result<
  void,
  IllegalEntityStateError |
  CannotChangeEntityTypeError |
  AppError.CannotUpdateFieldError
>

export class Entity extends AggregateRoot {
 
  private _state: EntityState;

  private constructor(id: EntityId, props: EntityState) {
    super(id);
    this._state = props;
  }

  public setHierarchy(hierarchy: Hierarchy) {
    this._state.hierarchy = hierarchy;
  }

  /**
   * todo: are undefined fields should be ignored?
   * phone should override or add ?
   * @param updateDto 
   */
  public updateDetails(updateDto: UpdateDto): UpdateResult {
    // check if the key is readonly and already has been set
    for(const f of Object.keys(updateDto)) {
      if (
        f in SET_ONLY_ONCE_FIELDS && 
        has(this._state, f as keyof UpdateDto)
      ){
        return err(AppError.CannotUpdateFieldError.create(f));
      }
    }
    // check for illegal 'entityType' transition
    if(
      has(updateDto, 'entityType') &&
      !Entity.isValidEntityTypeTransition(this._state.entityType, updateDto.entityType)
    ) {
      return err(CannotChangeEntityTypeError.create(this._state.entityType, updateDto.entityType));
    }
    const newState = { ...this._state, ...updateDto };
    const isValid = Entity.isValidEntityState(newState);
    if(isValid.isOk()) {
      this._state = newState;
    }
    return isValid;
  }

  private static isValidEntityState(state: EntityState): 
    Result<void, IllegalEntityStateError> {
    // entity has all common required fields
    for(const k of REQUIRED_COMMON_FIELDS) {
      if(!has(state, k)) {
        return err(IllegalEntityStateError.create(`entity missing required field: ${k}`));
      }
    }
    // entity has all required fields for it's type
    const { required, forbidden } = ENTITY_TYPE_VALID_STATE[state.entityType]
    for(const k of required) {
      if(!has(state, k)) {
        return err(IllegalEntityStateError.create(`${state.entityType} missing required field: ${k}`));
      }
    }
    // entity ***
    for(const k of forbidden) {
      if(has(state, k)) {
        return err(IllegalEntityStateError.create(`${state.entityType} cannot have field: ${k}`));
      }
    }
    return ok(undefined);
  }

  private static isValidEntityTypeTransition(from: EntityType, to: EntityType): boolean {
    if (
      from !== to && (
      from === EntityType.GoalUser ||
      to === EntityType.GoalUser)
    ) {
      return false;
    }
    return true;
  }

  static create(id: EntityId, state: EntityState, opts: CreateOpts): Result<Entity, IllegalEntityStateError> {
    const isValid = Entity.isValidEntityState(state);
    if (isValid.isOk()) {
      return ok(new Entity(id, state));
    }
    return err(isValid.error);
  }

  get entityId() {
    return EntityId.create(this.id.toValue());
  }
  get name() {
    return {
      firstName: this._state.firstName,
      lastName: this._state.lastName
    }
  }
  get entityType() {
    return this._state.entityType;
  }
  get personalNumber() {
    return this._state.personalNumber;
  }
  get identityCard() {
    return this._state.identityCard;
  }
  get rank() {
    return this._state.rank;
  }
  get akaUnit() {
    return this._state.akaUnit;
  }
  get hierarchy() {
    return this._state.hierarchy?.value();
  }
  get clearance() {
    return this._state.clearance;
  }
  get sex() {
    return this._state.sex;
  }
  get serviceType() {
    return this._state.serviceType;
  }
  get dischargeDate() {
    return this._state.dischargeDate;
  }
  get birthDate() {
    return this._state.birthDate;
  }
  get jobTitle() {
    return this._state.jobTitle;
  }
  get address() {
    return this._state.address;
  }
  get mail() {
    return this._state.mail;
  }
  get displayName() {
    return this._state.displayName;
  }
  get phone() {
    return Array.from(this._state.phone || []);
  }
  get mobilePhone() {
    return Array.from(this._state.mobilePhone || []);
  }
  get goalUserId() {
    return this._state.goalUserId;
  }
}
