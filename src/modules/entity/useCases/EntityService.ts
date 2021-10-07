import { entityRepository } from "./../repository/index";
import { EntityRepository } from "../repository/EntityRepository";
import { CreateEntityDTO } from "./dtos/CreateEntityDTO";
import {
  EntityType,
  Entity,
  castToEntityType,
  castToSex,
} from "../domain/Entity";
import { PersonalNumber } from "../domain/PersonalNumber";
import { combine, err, Result, ok } from "neverthrow";
import { EntityId } from "../domain/EntityId";
import { UpdateResult } from "../domain/Entity";
import { IdentityCard } from "../domain/IdentityCard";
import { ServiceType } from "../domain/ServiceType";
import { Rank } from "../domain/Rank";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Phone, MobilePhone } from "../domain/phone";
import { UniqueArray } from "../../../utils/UniqueArray";
import { filterNullOrUndefined, toArray } from "../../../utils/arrayUtils";
import { has } from "../../../utils/ObjectUtils";
import { AppError } from "../../../core/logic/AppError";
import { IllegalEntityStateError } from "../domain/errors/IllegalEntityStateError";
import { DigitalIdentityRepository } from "../../digitalIdentity/repository/DigitalIdentityRepository";
import { ConnectDigitalIdentityDTO } from "./dtos/ConnectDigitalIdentityDTO";
import { UpdateEntityDTO } from "./dtos/UpdateEntityDTO";
import { CannotChangeEntityTypeError } from "../domain/errors/CannotChangeEntityTypeError";
import { GoalUserIdAlreadyExistsError } from "./errors/GoalUserIdAlreadyExistsError";
import { IdentityCardAlreadyExistsError } from "./errors/IdentityCardAlreadyExistsError";
import { PersonalNumberAlreadyExistsError } from "./errors/PersonalNumberAlreadyExistsError";
import { EntityIsNotConnectedError } from "./errors/EntityIsNotConnectedError";
import { EntityResultDTO, entityToDTO } from "./dtos/EntityResultDTO";
import { HasDigitalIdentityAttached } from "./errors/HasDigitalIdentityAttached";
import { BaseError } from "../../../core/logic/BaseError";

export class EntityService {
  constructor(
    private entityRepository: EntityRepository,
    private diRepository: DigitalIdentityRepository
  ) {}

  async createEntity(
    createEntityDTO: CreateEntityDTO
  ): Promise<
    Result<
      EntityResultDTO,
      | AppError.ValueValidationError
      | IllegalEntityStateError
      | IdentityCardAlreadyExistsError
      | PersonalNumberAlreadyExistsError
      | GoalUserIdAlreadyExistsError
      | AppError.RetryableConflictError
    >
  > {
    let personalNumber,
      identityCard,
      serviceType,
      rank,
      goalUserId,
      phone,
      mobilePhone,
      sex,
      profilePicture;
    // check entity type
    const entityType = castToEntityType(createEntityDTO.entityType).mapErr(
      AppError.ValueValidationError.create
    );
    if (entityType.isErr()) {
      return err(entityType.error);
    }
    // extract all identifiers and check for duplicates for each one:
    if (has(createEntityDTO, "personalNumber")) {
      personalNumber = PersonalNumber.create(
        createEntityDTO.personalNumber
      ).mapErr(AppError.ValueValidationError.create);
      if (personalNumber.isErr()) {
        return err(personalNumber.error);
      }
      if (await this.entityRepository.exists(personalNumber.value)) {
        return err(
          PersonalNumberAlreadyExistsError.create(
            createEntityDTO.personalNumber
          )
        );
      }
    }
    if (has(createEntityDTO, "identityCard")) {
      identityCard = IdentityCard.create(createEntityDTO.identityCard).mapErr(
        AppError.ValueValidationError.create
      );
      if (identityCard.isErr()) {
        return err(identityCard.error);
      }
      if (await this.entityRepository.exists(identityCard.value)) {
        return err(
          IdentityCardAlreadyExistsError.create(createEntityDTO.identityCard)
        );
      }
    }
    if (has(createEntityDTO, "goalUserId")) {
      goalUserId = DigitalIdentityId.create(createEntityDTO.goalUserId).mapErr(
        AppError.ValueValidationError.create
      );
      if (goalUserId.isErr()) {
        return err(goalUserId.error);
      }
      if (await this.entityRepository.exists(goalUserId.value)) {
        return err(
          GoalUserIdAlreadyExistsError.create(createEntityDTO.goalUserId)
        );
      }
    }
    // extract all other existing fields
    if (has(createEntityDTO, "serviceType")) {
      serviceType = ServiceType.create(createEntityDTO.serviceType).mapErr(
        AppError.ValueValidationError.create
      );
      if (serviceType.isErr()) {
        return err(serviceType.error);
      }
    }
    if (has(createEntityDTO, "rank")) {
      rank = Rank.create(createEntityDTO.rank).mapErr(
        AppError.ValueValidationError.create
      );
      if (rank.isErr()) {
        return err(rank.error);
      }
    }
    if (has(createEntityDTO, "sex")) {
      sex = castToSex(createEntityDTO.sex).mapErr(
        AppError.ValueValidationError.create
      );
      if (sex.isErr()) {
        return err(sex.error);
      }
    }
    if (has(createEntityDTO, "phone")) {
      phone = combine(toArray(createEntityDTO.phone).map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (phone.isErr()) {
        return err(phone.error);
      }
    }
    if (has(createEntityDTO, "mobilePhone")) {
      mobilePhone = combine(
        toArray(createEntityDTO.mobilePhone).map(MobilePhone.create)
      )
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (mobilePhone.isErr()) {
        return err(mobilePhone.error);
      }
    }
    if (
      has(createEntityDTO, "pictures") &&
      has(createEntityDTO.pictures, "profile")
    ) {
      const {
        url: path,
        meta: { createdAt, updatedAt },
      } = createEntityDTO.pictures.profile;
      profilePicture = {
        path,
        createdAt,
        updatedAt,
      };
    }
    const entityOrError = Entity.createNew(
      this.entityRepository.generateEntityId(),
      {
        entityType: entityType.value,
        firstName: createEntityDTO.firstName,
        lastName: createEntityDTO.lastName,
        dischargeDay: createEntityDTO.dischargeDay,
        clearance: createEntityDTO.clearance,
        birthDate: createEntityDTO.birthDate,
        address: createEntityDTO.address,
        akaUnit: createEntityDTO.akaUnit,
        personalNumber: personalNumber?.value,
        identityCard: identityCard?.value,
        goalUserId: goalUserId?.value,
        rank: rank?.value,
        serviceType: serviceType?.value,
        sex: sex?.value,
        mobilePhone: mobilePhone?.value,
        phone: phone?.value,
        profilePicture,
      }
    );
    if (entityOrError.isErr()) {
      return err(entityOrError.error);
    }
    let val = (await this.entityRepository.save(entityOrError.value))
      .map(() => entityToDTO(entityOrError.value))
      .mapErr((err) => AppError.RetryableConflictError.create(err.message));
    return val;
  }

  async connectDigitalIdentity(
    connectDTO: ConnectDigitalIdentityDTO
  ): Promise<
    Result<
      void,
      | AppError.ValueValidationError
      | AppError.ResourceNotFound
      | AppError.RetryableConflictError
    >
  > {
    const entityId = EntityId.create(connectDTO.id);
    const uidOrError = DigitalIdentityId.create(
      connectDTO.uniqueId
    ).mapErr(AppError.ValueValidationError.create);
    if (uidOrError.isErr()) {
      return err(uidOrError.error);
    }
    // get the objects from Repo
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(
        AppError.ResourceNotFound.create(connectDTO.id, "entity")
      );
    }
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if (!di) {
      return err(
        AppError.ResourceNotFound.create(
          connectDTO.uniqueId,
          "digital identity"
        )
      );
    }
    // connect the entityy to the digital identity
    di.connectToEntity(entity);
    const connectedDIs = (await this.diRepository.getByEntityId(entityId)).map(
      (di) => di.connectedDigitalIdentity
    );
    entity.choosePrimaryDigitalIdentity(connectedDIs);
    const saveDiRes = (await this.diRepository.save(di)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (saveDiRes.isErr()) return saveDiRes;
    const saveEntityRes = (await this.entityRepository.save(entity)).mapErr(
      (err) => AppError.RetryableConflictError.create(err.message)
    );
    return saveEntityRes;
  }

  async disconnectDigitalIdentity(
    disconnectDTO: ConnectDigitalIdentityDTO
  ): Promise<
    Result<
      void,
      | AppError.ValueValidationError
      | AppError.ResourceNotFound
      | EntityIsNotConnectedError
      | AppError.RetryableConflictError
    >
  > {
    const entityId = EntityId.create(disconnectDTO.id);
    const uidOrError = DigitalIdentityId.create(
      disconnectDTO.uniqueId
    ).mapErr(AppError.ValueValidationError.create);
    if (uidOrError.isErr()) {
      return err(uidOrError.error);
    }
    // get digital identity from Repo
    // get the objects from Repo
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(
        AppError.ResourceNotFound.create(disconnectDTO.id, "entity")
      );
    }
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if (!di) {
      return err(
        AppError.ResourceNotFound.create(
          disconnectDTO.uniqueId,
          "digital identity"
        )
      );
    }
    if (!di.connectedEntityId?.equals(entityId)) {
      return err(
        EntityIsNotConnectedError.create(
          disconnectDTO.id,
          disconnectDTO.uniqueId
        )
      );
    }
    // disconnect the entityy to the digital identity
    di.disconnectEntity();
    // disconnect the digital identity to the entity
    const connectedDIs = (await this.diRepository.getByEntityId(entityId)).map(
      (di) => di.connectedDigitalIdentity
    );

    entity.choosePrimaryDigitalIdentity(connectedDIs);
    const saveDiRes = (await this.diRepository.save(di)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
    if (saveDiRes.isErr()) return saveDiRes;
    const saveEntityRes = (await this.entityRepository.save(entity)).mapErr(
      (err) => AppError.RetryableConflictError.create(err.message)
    );
    return saveEntityRes;
  }

  /**
   *
   * @param updateDTO
   */
  async updateEntity(
    updateDTO: UpdateEntityDTO
  ): Promise<
    Result<
      EntityResultDTO,
      | AppError.ResourceNotFound
      | AppError.ValueValidationError
      | AppError.CannotUpdateFieldError
      | AppError.RetryableConflictError
      | CannotChangeEntityTypeError
      | IllegalEntityStateError
      | GoalUserIdAlreadyExistsError
      | IdentityCardAlreadyExistsError
      | PersonalNumberAlreadyExistsError
    >
  > {
    let changes: UpdateResult[] = [];
    const entityId = EntityId.create(updateDTO.entityId);
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(
        AppError.ResourceNotFound.create(updateDTO.entityId, "entity")
      );
    }
    // try to update entity for each existing field in the DTO
    if (has(updateDTO, "personalNumber")) {
      const personalNumber = PersonalNumber.create(
        updateDTO.personalNumber
      ).mapErr(AppError.ValueValidationError.create);
      if (personalNumber.isErr()) {
        return err(personalNumber.error);
      }
      if (!entity.personalNumber?.equals(personalNumber.value)) {
        if (await this.entityRepository.exists(personalNumber.value)) {
          return err(
            PersonalNumberAlreadyExistsError.create(
              personalNumber.value.toString()
            )
          );
        }
        changes.push(
          entity.updateDetails({ personalNumber: personalNumber.value })
        );
      }
    }
    if (has(updateDTO, "identityCard")) {
      const identityCard = IdentityCard.create(updateDTO.identityCard).mapErr(
        AppError.ValueValidationError.create
      );
      if (identityCard.isErr()) {
        return err(identityCard.error);
      }
      if (!entity.identityCard?.equals(identityCard.value)) {
        if (await this.entityRepository.exists(identityCard.value)) {
          return err(
            IdentityCardAlreadyExistsError.create(identityCard.value.toString())
          );
        }
        changes.push(
          entity.updateDetails({ identityCard: identityCard.value })
        );
      }
    }
    if (has(updateDTO, "goalUserId")) {
      const goalUserId = DigitalIdentityId.create(updateDTO.goalUserId).mapErr(
        AppError.ValueValidationError.create
      );
      if (goalUserId.isErr()) {
        return err(goalUserId.error);
      }
      if (!entity.goalUserId?.equals(goalUserId.value)) {
        if (await this.entityRepository.exists(goalUserId.value)) {
          return err(
            GoalUserIdAlreadyExistsError.create(goalUserId.value.toString())
          );
        }
        changes.push(entity.updateDetails({ goalUserId: goalUserId.value }));
      }
    }
    if (has(updateDTO, "serviceType")) {
      const serviceType = ServiceType.create(updateDTO.serviceType).mapErr(
        AppError.ValueValidationError.create
      );
      if (serviceType.isOk()) {
        changes.push(entity.updateDetails({ serviceType: serviceType.value }));
      } else {
        return err(serviceType.error);
      }
    }
    if (has(updateDTO, "rank")) {
      const rank = Rank.create(updateDTO.rank).mapErr(
        AppError.ValueValidationError.create
      );
      if (rank.isOk()) {
        changes.push(entity.updateDetails({ rank: rank.value }));
      } else {
        return err(rank.error);
      }
    }

    if (has(updateDTO, "sex")) {
      const sex = castToSex(updateDTO.sex).mapErr(
        AppError.ValueValidationError.create
      );
      if (sex.isOk()) {
        changes.push(entity.updateDetails({ sex: sex.value }));
      } else {
        return err(sex.error);
      }
    }
    if (has(updateDTO, "phone")) {
      const phone = combine(toArray(updateDTO.phone).map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (phone.isOk()) {
        changes.push(entity.updateDetails({ phone: phone.value }));
      } else {
        return err(phone.error);
      }
    }
    if (has(updateDTO, "mobilePhone")) {
      const mobilePhone = combine(
        toArray(updateDTO.mobilePhone).map(MobilePhone.create)
      )
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if (mobilePhone.isOk()) {
        changes.push(entity.updateDetails({ mobilePhone: mobilePhone.value }));
      } else {
        return err(mobilePhone.error);
      }
    }
    // check that all entity update calls returned success result
    const result = combine(changes);
    if (result.isErr()) {
      return err(result.error);
    }
    // finally, save the entity
    return (await this.entityRepository.save(entity))
      .map(() => entityToDTO(entity)) // return DTO
      .mapErr((err) => AppError.RetryableConflictError.create(err.message)); // or Error
  }

  async deleteEntity(id: string): Promise<Result<any, BaseError>> {
    const entityId = EntityId.create(id);
    const entity = await this.entityRepository.getByEntityId(entityId);
    if (!entity) {
      return err(AppError.ResourceNotFound.create(id, "Entity"));
    }
    // TODO: check for condition in usecase instead of here
    // if(!!entity.connectedDIs && entity.connectedDIs.length != 0){
    //   return err(HasDigitalIdentityAttached.create(id));
    // }
    // const digitalIdentities = await this.diRepository.getByEntityId(entityId); Without CONNECTEDDIs property
    // if(!digitalIdentities){
    //   return err(AppError.ResourceNotFound.create(id, 'Digital Identity'));
    // }
    // if(digitalIdentities.length !=0){
    //   return err(HasDigitalIdentityAttached.create(id));
    // }
    return (await this.entityRepository.delete(entityId)).mapErr((err) =>
      AppError.RetryableConflictError.create(err.message)
    );
  }
}
