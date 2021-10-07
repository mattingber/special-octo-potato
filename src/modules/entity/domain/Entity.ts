import { DigitalIdentityRepresent } from "./../../digitalIdentity/domain/DigitalIdentity";
import { PrimaryDigitalIdentityService } from "./PrimaryDigitalIdentityService";
import { IConnectedDI } from "./ConnectedDI";
import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { EntityId } from "./EntityId";
import { has, hasAll } from "../../../utils/ObjectUtils";
import { Result, err, ok } from "neverthrow";
import { IllegalEntityStateError } from "./errors/IllegalEntityStateError";
import { AppError } from "../../../core/logic/AppError";
import { CannotChangeEntityTypeError } from "./errors/CannotChangeEntityTypeError";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { PersonalNumber } from "./PersonalNumber";
import { IdentityCard } from "./IdentityCard";
import { Rank } from "./Rank";
import { Mail } from "../../digitalIdentity/domain/Mail";
import { Phone, MobilePhone } from "./phone";
import { UniqueArray } from "../../../utils/UniqueArray";
import { ServiceType } from "./ServiceType";
import { isSomeEnum } from "../../../utils/isSomeEnum";
import { DigitalIdentityState } from "../../digitalIdentity/domain/DigitalIdentity";

export enum EntityType {
  Soldier = 'agumon',
  Civilian = 'digimon',
  GoalUser = 'tamar'
}
const isEntityType = isSomeEnum(EntityType);
export const castToEntityType = (val: string): Result<EntityType, string> => {
  if (isEntityType(val)) {
    return ok(val);
  }
  return err(`${val} is invalid EntityType`);
};

export enum Sex {
  Male = "male",
  Female = "female",
}

const isSex = isSomeEnum(Sex);
export const castToSex = (val: string): Result<Sex, string> => {
  if (isSex(val)) {
    return ok(val);
  }
  return err(`${val} is invalid Sex`);
};

// type CommonEntityProps = {
//   firstName: string;
//   entityType: EntityType;
//   hierarchy?: Hierarchy;
//   clearance?: number; // value object
//   mail?: string; //value object, should be required??
//   jobTitle?: string;
// }

// type PersonProps = {
//   firstName: string;
//   lastName: string;
//   clearance: number;
//   sex?: Sex;
//   address?: string;
//   dischargeDate?: Date;
//   birthDate?: Date;
//   serviceType: string; //value object
//   phone?: Set<string>; //value object
//   mobilePhone?: Set<string>; //value object
// }

// type GoalUserEntityProps = CommonEntityProps & {
//   goalUserId: string;
// }

// type SoldierEntityProps = {
//   personalNumber: string; // use value object
//   identityCard?: string;
//   rank?: string; //use vale object / enum
//   akaUnit?: string
// }

// type CivilianEntityProps = {
//   identityCard: string;
//   personalNumber?: string;
// }

// // type EntityState = CommonEntityProps &
// //   Partial<PersonProps> &
// //   Partial<CivilianEntityProps> &
// //   Partial<SoldierEntityProps>

// type CreateSoldierProps = CommonEntityProps & PersonProps & SoldierEntityProps;
// type CreateCivilianProps = CommonEntityProps & PersonProps & CivilianEntityProps;

type PictureData = {
  path: string;
  updatedAt?: Date;
  createdAt: Date;
};

type EntityState = {
  firstName: string;
  lastName?: string;
  entityType: EntityType;
  displayName?: string; // TODO maybe remove thid field
  personalNumber?: PersonalNumber;
  identityCard?: IdentityCard;
  rank?: Rank;
  akaUnit?: string;
  clearance?: number; // value object
  mail?: Mail;
  sex?: Sex;
  serviceType?: ServiceType;
  dischargeDay?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: UniqueArray<Phone>; //value object
  mobilePhone?: UniqueArray<MobilePhone>; //value object
  goalUserId?: DigitalIdentityId;
  primaryDigitalIdentityId?: DigitalIdentityId;
  profilePicture?: PictureData;
};

type CreateEntityProps = Omit<EntityState, "mail" | "primaryDigitalIdentity">;

// type CreatePersonProps =
//   Required<Pick<EntityState, 'firstName' | 'lastName'>> &
//   Partial<Pick<EntityState, 'clearance' | 'phone' | 'mobilePhone' | 'address'
//     | 'sex' | 'serviceType' | 'dischargeDate' | 'birthDate' | 'rank' | 'akaUnit'
//     | 'identityCard' | 'personalNumber'>>;
// type CreateSoldierProps = CreatePersonProps & Required<Pick<EntityState, 'personalNumber'>>;
// type CreateCivilianProps = CreatePersonProps & Required<Pick<EntityState, 'identityCard'>>;
// type CreateGoalUserProps =
//   Required<Pick<EntityState, 'firstName' | 'goalUserId'>> &
//   Partial<Pick<EntityState, 'phone' | 'mobilePhone' | 'address' | 'clearance' | 'lastName'>>

const REQUIRED_COMMON_FIELDS: (keyof EntityState)[] = [
  "firstName",
  "entityType",
];

// type PersonState =
//   CommonState &
//   Required<Pick<EntityState, 'lastName' | 'serviceType'>> &
//   Pick<EntityState, 'sex' | 'address' | 'dischargeDate' | 'birthDate' | 'phone' | 'mobilePhone'>;

const REQUIRED_PERSON_FIELDS: (keyof EntityState)[] = [
  "firstName",
  "lastName",
  // "serviceType",
];

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
    required: (keyof EntityState)[];
    forbidden: (keyof EntityState)[];
  };
} = {
  [EntityType.Civilian]: {
    required: [...REQUIRED_PERSON_FIELDS, "identityCard"],
    forbidden: ["goalUserId"],
  },
  [EntityType.Soldier]: {
    required: [...REQUIRED_PERSON_FIELDS, "personalNumber"],
    forbidden: ["goalUserId"],
  },
  [EntityType.GoalUser]: {
    required: ["firstName", "goalUserId"],
    forbidden: [
      "identityCard",
      "rank",
      "serviceType",
      "sex",
      "address",
      "dischargeDay",
      "birthDate",
    ],
  },
};

const SET_ONLY_ONCE_FIELDS = new Set([
  "sex",
  "identityCard",
  "personalNumber",
  "birthDate",
] as (keyof EntityState)[]);

type UpdateDto = Partial<Omit<EntityState, "displayName" | "profilePicture">>;
export type UpdateResult = Result<
  void,
  | IllegalEntityStateError
  | CannotChangeEntityTypeError
  | AppError.CannotUpdateFieldError
>;

export class Entity extends AggregateRoot {
  private _state: EntityState;

  private constructor(id: EntityId, props: EntityState, opts: CreateOpts) {
    super(id, opts);
    this._state = props;
  }

  // public setHierarchy(hierarchy: Hierarchy) {
  //   this._state.hierarchy = hierarchy;
  // }

  /**
   * //TODO: are undefined fields should be ignored?
   * //TODO: probably should break this into many small update methods like 'updatePictureData' below
   * phone should override or add ?
   * @param updateDto
   */
  public updateDetails(updateDto: UpdateDto): UpdateResult {
    // check if the key is readonly and already has been set
    for (const f of Object.keys(updateDto)) {
      if (f in SET_ONLY_ONCE_FIELDS && has(this._state, f as keyof UpdateDto)) {
        return err(AppError.CannotUpdateFieldError.create(f));
      }
    }
    // check for illegal 'entityType' transition
    if (
      has(updateDto, "entityType") &&
      !Entity.isValidEntityTypeTransition(
        this._state.entityType,
        updateDto.entityType
      )
    ) {
      return err(
        CannotChangeEntityTypeError.create(
          this._state.entityType,
          updateDto.entityType
        )
      );
    }
    const newState = { ...this._state, ...updateDto };
    const isValid = Entity.isValidEntityState(newState);
    if (isValid.isOk()) {
      this._state = newState;
    }
    this.markModified();
    return isValid;
  }

  public updatePictureData(
    update: Partial<PictureData>
  ): Result<void, IllegalEntityStateError> {
    const pictureData = { ...this._state.profilePicture, ...update };
    // update only if the resulting data has the required keys
    if (hasAll(pictureData, ["path", "createdAt"])) {
      this._state.profilePicture = pictureData;
      this.markModified();
      return ok(undefined);
    }
    return err(IllegalEntityStateError.create("illegal picture data update"));
  }

  private static isValidEntityState(
    state: EntityState
  ): Result<void, IllegalEntityStateError> {
    // entity has all common required fields
    for (const k of REQUIRED_COMMON_FIELDS) {
      if (!has(state, k)) {
        return err(
          IllegalEntityStateError.create(`entity missing required field: ${k}`)
        );
      }
    }
    // entity has all required fields for it's type
    const { required, forbidden } = ENTITY_TYPE_VALID_STATE[state.entityType];
    for (const k of required) {
      if (!has(state, k)) {
        return err(
          IllegalEntityStateError.create(
            `${state.entityType} missing required field: ${k}`
          )
        );
      }
    }
    // entity ***
    for (const k of forbidden) {
      if (has(state, k)) {
        return err(
          IllegalEntityStateError.create(
            `${state.entityType} cannot have field: ${k}`
          )
        );
      }
    }
    // specific Rules:
    // goalUserId must equal PrimaryDigitalIdentityId when both are defined
    if (state.entityType === EntityType.GoalUser) {
      if (
        !!state.goalUserId &&
        !!state.primaryDigitalIdentityId &&
        ~state.goalUserId.equals(state.primaryDigitalIdentityId)
      ) {
        return err(
          IllegalEntityStateError.create(
            `goalUserId must be the same as primaryDigitalIdentityId`
          )
        );
      }
    }
    return ok(undefined);
  }

  private static isValidEntityTypeTransition(
    from: EntityType,
    to: EntityType
  ): boolean {
    if (
      from !== to &&
      (from === EntityType.GoalUser || to === EntityType.GoalUser)
    ) {
      return false;
    }
    return true;
  }

  static _create(
    id: EntityId,
    state: EntityState,
    opts: CreateOpts
  ): Result<Entity, IllegalEntityStateError> {
    const isValid = Entity.isValidEntityState(state);
    if (isValid.isOk()) {
      return ok(new Entity(id, state, opts));
    }
    return err(isValid.error);
  }

  static createNew(id: EntityId, props: CreateEntityProps) {
    return Entity._create(id, props, { isNew: true });
  }

  // public connectDI(digitalIdentity: IConnectedDI) {
  //   const isAlreadyConnected = this._state.connectedDIs?.map(di => di.uniqueId.toString()).includes(digitalIdentity.uniqueId.toString());
  //   if (isAlreadyConnected) return; //TODO: is error?
  //   this._state.connectedDIs?.push(digitalIdentity);
  //   this.choosePrimaryDigitalIdentity()
  //   this.markModified();
  //   return ok(undefined);
  // }

  // public disconnectDI(digitalIdentity: IConnectedDI) {
  //   const existsIndex = this._state.connectedDIs?.map(di => di.uniqueId.toString()).indexOf(digitalIdentity.uniqueId.toString());
  //   if (!existsIndex) return; //TODO: is error?
  //   this._state.connectedDIs?.splice(existsIndex, 1);
  //   this.choosePrimaryDigitalIdentity()
  //   this.markModified();
  //   return ok(undefined);
  // }

  public choosePrimaryDigitalIdentity(
    connectedDIs: DigitalIdentityRepresent[]
  ) {
    const connected = connectedDIs;
    // no connected DIs, set primary to undefined
    if (connected.length === 0) {
      return undefined;
    }
    // check if current primary has the strongest source
    let currentPrimary = connected.find((di) =>
      di.uniqueId.equals(this._state.primaryDigitalIdentityId)
    );
    if (
      !!currentPrimary &&
      PrimaryDigitalIdentityService.haveStrongSource(currentPrimary)
    ) {
      return;
    }
    // find if one of the other DIs has the strongest source
    const strongSourceDI = connected.find(
      PrimaryDigitalIdentityService.haveStrongSource
    );
    if (!!strongSourceDI) {
      this._state.primaryDigitalIdentityId = strongSourceDI.uniqueId;
    }
    // check for primary source DI (and the current primary has not)
    const primarySourceDI = connected.find((di) =>
      PrimaryDigitalIdentityService.havePrimarySource(this._state.akaUnit, di)
    );
    if (
      (!currentPrimary ||
        !PrimaryDigitalIdentityService.havePrimarySource(
          this._state.akaUnit,
          currentPrimary
        )) &&
      !!primarySourceDI
    ) {
      this._state.primaryDigitalIdentityId = primarySourceDI.uniqueId;
    }
    // connect one of the DIs
    if (!currentPrimary) {
      this._state.primaryDigitalIdentityId = connected[0].uniqueId;
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

  // static createSoldier(id: EntityId, props: CreateSoldierProps) {
  //   return Entity.create(
  //     id,
  //     { ...props, entityType: EntityType.Soldier },
  //     { isNew: true }
  //   );
  // }

  // static createCivilian(id: EntityId, props: CreateCivilianProps) {
  //   return Entity.create(
  //     id,
  //     { ...props, entityType: EntityType.Civilian },
  //     { isNew: true }
  //   );
  // }

  // static createGoalUser(id: EntityId, props: CreateGoalUserProps) {
  //   return Entity.create(
  //     id,
  //     { ...props, entityType: EntityType.GoalUser },
  //     { isNew: true }
  //   );
  // }

  get entityId() {
    return EntityId.create(this.id.toValue());
  }
  get name() {
    return {
      firstName: this._state.firstName,
      lastName: this._state.lastName,
    };
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
  get clearance() {
    return this._state.clearance;
  }
  get sex() {
    return this._state.sex;
  }
  get serviceType() {
    return this._state.serviceType;
  }
  get dischargeDay() {
    return this._state.dischargeDay;
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
    return this._state.phone?.toArray() || [];
  }
  get mobilePhone() {
    return this._state.mobilePhone?.toArray() || [];
  }
  get goalUserId() {
    return this._state.goalUserId;
  }
  get primaryDigitalIdentityId() {
    return this._state.primaryDigitalIdentityId;
  }

  get profilePicture() {
    return this._state.profilePicture;
  }

  // get hierarchy() {
  //   return this._state.hierarchy?.value();
  // }
}
