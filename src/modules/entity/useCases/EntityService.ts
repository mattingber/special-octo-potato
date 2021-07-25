import { EntityRepository } from "../repository/EntityRepository";
import { CreateEntityDTO } from "./dtos/CreateEntityDTO";
import { EntityType, Entity, isEntityType, castToEntityType, castToSex } from "../domain/Entity";
import { PersonalNumber } from "../domain/PersonalNumber";
import { combine } from "neverthrow";
import { EntityId } from "../domain/EntityId";
import { IdentityCard } from "../domain/IdentityCard";
import { ServiceType } from "../domain/ServiceType";
import { Rank } from "../domain/Rank";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Phone, MobilePhone } from "../domain/phone";
import { UniqueArray } from "../../../utils/UniqueArray";
import { filterNullOrUndefined } from "../../../utils/arrayUtils";

export class EntityService {
  constructor(
    private entityRepository: EntityRepository,
  ){}

  async createEntity(createEntityDTO: CreateEntityDTO) {
    const personalNumber = createEntityDTO.personalNumber ? 
      PersonalNumber.create(createEntityDTO.personalNumber): undefined;
    const identityCard = createEntityDTO.identityCard ? 
      IdentityCard.create(createEntityDTO.identityCard): undefined;
    const serviceType = createEntityDTO.serviceType ? 
      ServiceType.create(createEntityDTO.serviceType): undefined;
    const rank = createEntityDTO.rank ? 
      Rank.create(createEntityDTO.rank): undefined;
    const goalUserId = createEntityDTO.goalUserId ? 
      DigitalIdentityId.create(createEntityDTO.goalUserId): undefined;
    // TODO enums?
    const entityType = castToEntityType(createEntityDTO.entityType);
    const sex = createEntityDTO.sex ? castToSex(createEntityDTO.sex) : undefined;

    const phone = createEntityDTO.phone ? 
      combine(createEntityDTO.phone.map(Phone.create))
      .map(UniqueArray.fromArray) : undefined;
    const mobilePhone = createEntityDTO.mobilePhone ? 
      combine(createEntityDTO.mobilePhone.map(MobilePhone.create))
      .map(UniqueArray.fromArray) : undefined;

    const res = combine(
      filterNullOrUndefined([personalNumber, identityCard, serviceType, rank, goalUserId, entityType, sex, phone, mobilePhone])
    );

    if(res.isErr()) {
      return;
    }

    Entity.create(
      this.entityRepository.generateEntityId(), 
      {
        

      },
      { isNew: true }
    )

  }

  private createSoldier(createEntityDTO: CreateEntityDTO) {
    const personalNumber = PersonalNumber.create(createEntityDTO.personalNumber)
  }
}