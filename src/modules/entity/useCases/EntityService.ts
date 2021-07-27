import { EntityRepository } from "../repository/EntityRepository";
import { CreateEntityDTO } from "./dtos/CreateEntityDTO";
import { EntityType, Entity, castToEntityType, castToSex } from "../domain/Entity";
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
import { filterNullOrUndefined } from "../../../utils/arrayUtils";
import { has } from "../../../utils/ObjectUtils";
import { AppError } from "../../../core/logic/AppError";
import { IllegalEntityStateError } from "../domain/errors/IllegalEntityStateError";
import { DigitalIdentityRepository } from "../../digitalIdentity/repository/DigitalIdentityRepository";
import { ConnectDigitalIdentityDTO } from "./dtos/ConnectDigitalIdentityDTO";
import { UpdateEntityDTO } from "./dtos/UpdateEntityDTO";
import { CannotChangeEntityTypeError } from "../domain/errors/CannotChangeEntityTypeError";

export class EntityService {
  constructor(
    private entityRepository: EntityRepository,
    private diRepository: DigitalIdentityRepository,
  ){}

  async createEntity(createEntityDTO: CreateEntityDTO): Promise<Result<
    void,
    AppError.ValueValidationError | 
    IllegalEntityStateError
  >> {
    let personalNumber, identityCard, serviceType, rank, goalUserId, phone, mobilePhone, sex;
    // check entity type
    const entityType = castToEntityType(createEntityDTO.entityType)
      .mapErr(AppError.ValueValidationError.create);
    if(entityType.isErr()) { return err(entityType.error); }
    // extract all other existing fields
    if(has(createEntityDTO, 'personalNumber')) {
      personalNumber = PersonalNumber.create(createEntityDTO.personalNumber)
        .mapErr(AppError.ValueValidationError.create);
      if(personalNumber.isErr()) { return err(personalNumber.error); }
    }
    if(has(createEntityDTO, 'identityCard')) {
      identityCard = IdentityCard.create(createEntityDTO.identityCard)
        .mapErr(AppError.ValueValidationError.create);
      if(identityCard.isErr()) { return err(identityCard.error); }
    }
    if(has(createEntityDTO, 'serviceType')) {
      serviceType = ServiceType.create(createEntityDTO.serviceType)
        .mapErr(AppError.ValueValidationError.create);
      if(serviceType.isErr()) { return err(serviceType.error); }
    }
    if(has(createEntityDTO, 'rank')) {
      rank = Rank.create(createEntityDTO.rank)
        .mapErr(AppError.ValueValidationError.create);
      if(rank.isErr()) { return err(rank.error); }
    }
    if(has(createEntityDTO, 'goalUserId')) {
      goalUserId = DigitalIdentityId.create(createEntityDTO.goalUserId)
        .mapErr(AppError.ValueValidationError.create);
      if(goalUserId.isErr()) { return err(goalUserId.error); }
    }
    if(has(createEntityDTO, 'sex')) {
      sex = castToSex(createEntityDTO.sex).mapErr(AppError.ValueValidationError.create);
      if(sex.isErr()) { return err(sex.error); }
    }
    if(has(createEntityDTO, 'phone')) {
      phone = combine(createEntityDTO.phone.map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if(phone.isErr()) { return err(phone.error); }
    }
    if(has(createEntityDTO, 'mobilePhone')) {
      mobilePhone = combine(createEntityDTO.mobilePhone.map(MobilePhone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if(mobilePhone.isErr()) { return err(mobilePhone.error); }
    }
    const result = Entity.create(
      this.entityRepository.generateEntityId(), 
      {
        entityType: entityType.value,
        firstName: createEntityDTO.firstName,
        lastName: createEntityDTO.lastName,
        clearance: createEntityDTO.clearance,
        dischargeDate: createEntityDTO.dischargeDate,
        birthDate: createEntityDTO. birthDate,
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
      },
      { isNew: true }
    );
    if(result.isErr()) {
      return err(result.error)
    }
    // check entity existance 
    if(await this.entityRepository.exists({
      identityCard: identityCard?.value, 
      personalNumber: personalNumber?.value,
      goalUserId: goalUserId?.value
    })) {
      // TODO: error for this
    }
    await this.entityRepository.save(result.value);
    return ok(undefined);
  }

  async connectDigitalIdentity(connectDTO: ConnectDigitalIdentityDTO): Promise<Result<
    void,
    AppError.ValueValidationError |
    AppError.ResourceNotFound
  >> {
    const entityId = EntityId.create(connectDTO.entityId);
    const uidOrError = DigitalIdentityId.create(connectDTO.digitalIdentityUniqueId)
      .mapErr(AppError.ValueValidationError.create);
    if(uidOrError.isErr()) { return err(uidOrError.error); }
    // get the objects from Repo
    const entity = await this.entityRepository.getByEntityId(entityId);
    if(!entity) {
      return err(AppError.ResourceNotFound.create(connectDTO.entityId, 'entity'));
    }
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if(!di) {
      return err(AppError.ResourceNotFound.create(connectDTO.digitalIdentityUniqueId, 'digital identity'));
    }
    // connect the digital identity to the entity
    di.connectToEntity(entity);
    return ok(undefined);
  }

  async disconnectDigitalIdentity(disconnectDTO: ConnectDigitalIdentityDTO): Promise<Result<
    void,
    AppError.ValueValidationError |
    AppError.ResourceNotFound
  >> {
    const entityId = EntityId.create(disconnectDTO.entityId);
    const uidOrError = DigitalIdentityId.create(disconnectDTO.digitalIdentityUniqueId)
      .mapErr(AppError.ValueValidationError.create);
    if(uidOrError.isErr()) { return err(uidOrError.error); }
    // get digital identity from Repo
    const di = await this.diRepository.getByUniqueId(uidOrError.value);
    if(!di) {
      return err(AppError.ResourceNotFound.create(disconnectDTO.digitalIdentityUniqueId, 'digital identity'));
    }
    if(!di.connectedEntityId?.equals(entityId)) {
      // TODO: add error for this case
    }
    // connect the digital identity to the entity
    di.disconnectEntity();
    return ok(undefined);
  }

  async updateEntity(updateDTO: UpdateEntityDTO): Promise<Result<
    void,
    AppError.ResourceNotFound |
    AppError.ValueValidationError | 
    AppError.CannotUpdateFieldError | 
    CannotChangeEntityTypeError |
    IllegalEntityStateError
  >> {
    let changes: UpdateResult[] = [];
    const entityId = EntityId.create(updateDTO.entityId);
    const entity = await this.entityRepository.getByEntityId(entityId);
    if(!entity) {
      return err(AppError.ResourceNotFound.create(updateDTO.entityId, 'entity'));
    }
    // try to update entity for each existing field in the DTO
    if(has(updateDTO, 'personalNumber')) {
      const personalNumber = PersonalNumber.create(updateDTO.personalNumber)
        .mapErr(AppError.ValueValidationError.create);
      if(personalNumber.isOk()) {
        if(entity.personalNumber)
        changes.push(entity.updateDetails({ personalNumber: personalNumber.value }));
      } else {
        return err(personalNumber.error);
      }
    }
    if(has(updateDTO, 'identityCard')) {
      const identityCard = IdentityCard.create(updateDTO.identityCard)
        .mapErr(AppError.ValueValidationError.create);
      if(identityCard.isOk()) {
        changes.push(entity.updateDetails({ identityCard: identityCard.value }));
      } else {
        return err(identityCard.error);
      }
    }
    if(has(updateDTO, 'serviceType')) {
      const serviceType = ServiceType.create(updateDTO.serviceType)
        .mapErr(AppError.ValueValidationError.create);
      if(serviceType.isOk()) {
        changes.push(entity.updateDetails({ serviceType: serviceType.value }));
      } else {
        return err(serviceType.error);
      }
    }
    if(has(updateDTO, 'rank')) {
      const rank = Rank.create(updateDTO.rank)
        .mapErr(AppError.ValueValidationError.create);
      if(rank.isOk()) {
        changes.push(entity.updateDetails({ rank: rank.value }));
      } else {
        return err(rank.error);
      }
    }
    if(has(updateDTO, 'goalUserId')) {
      const goalUserId = DigitalIdentityId.create(updateDTO.goalUserId)
        .mapErr(AppError.ValueValidationError.create);
      if(goalUserId.isOk()) {
        changes.push(entity.updateDetails({ goalUserId: goalUserId.value }));
      } else {
        return err(goalUserId.error);
      }
    }
    if(has(updateDTO, 'sex')) {
      const sex = castToSex(updateDTO.sex).mapErr(AppError.ValueValidationError.create);
      if(sex.isOk()) {
        changes.push(entity.updateDetails({ sex: sex.value }));
      } else {
        return err(sex.error);
      }
    }
    if(has(updateDTO, 'phone')) {
      const phone = combine(updateDTO.phone.map(Phone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if(phone.isOk()) {
        changes.push(entity.updateDetails({ phone: phone.value }));
      } else {
        return err(phone.error);
      }
    }
    if(has(updateDTO, 'mobilePhone')) {
      const mobilePhone = combine(updateDTO.mobilePhone.map(MobilePhone.create))
        .mapErr(AppError.ValueValidationError.create)
        .map(UniqueArray.fromArray);
      if(mobilePhone.isOk()) {
        changes.push(entity.updateDetails({ mobilePhone: mobilePhone.value }));
      } else {
        return err(mobilePhone.error);
      }
    }
    // check that all entity update calls returned success result
    const result = combine(changes);
    if(result.isErr()) {
      return err(result.error);
    }
    // finally, save the entity
    await this.entityRepository.save(entity);
    return ok(undefined);
  }

  // TODO: implement delete entity

}