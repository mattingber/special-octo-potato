import { Types } from "mongoose";
import { Entity } from "../../domain/Entity";
import { EntityId } from "../../domain/EntityId";
import { PersonalNumber } from "../../domain/PersonalNumber";
import { IdentityCard } from "../../domain/IdentityCard";
import { Rank } from "../../domain/Rank";
import { ServiceType } from "../../domain/ServiceType";
import { Mail } from "../../../digitalIdentity/domain/Mail";
import { UniqueArray } from "../../../../utils/UniqueArray";
import { Phone, MobilePhone } from "../../domain/phone";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { EntityDoc } from "./EntitySchema";

export class EntityMapper {

  static toPersistance(entity: Entity): EntityDoc {
    return {
      _id: Types.ObjectId(entity.entityId.toString()),
      firstName: entity.name.firstName,
      lastName: entity.name.lastName,
      entityType: entity.entityType,
      displayName: entity.displayName,
      personalNumber: entity.personalNumber?.toString(), 
      identityCard: entity.identityCard?.toString(),
      rank: entity.rank?.value, 
      akaUnit: entity.akaUnit,
      clearance: entity.clearance, // value object
      mail: entity.mail?.value, 
      sex: entity.sex,
      serviceType: entity.serviceType?.value,
      dischargeDate: entity.dischargeDate,
      birthDate: entity.birthDate,
      jobTitle: entity.jobTitle,
      address: entity.address, // value?
      phone: entity.phone.map(p => p.value), 
      mobilePhone: entity.mobilePhone.map(p => p.value),
      goalUserId: entity.goalUserId?.toString(),
      primaryDigitalIdentityId: entity.primaryDigitalIdentityId?.toString(),
      version: entity.version,
      pictures: entity.profilePicture ? {
        profile: {
          path: entity.profilePicture.path,
          meta: {
            createdAt: entity.profilePicture.createdAt,
            updatedAt: entity.profilePicture.updatedAt,
          }
        }
      } : undefined,
    }
  }

  static toDomain(raw: EntityDoc): Entity {
    const entityId = EntityId.create(raw._id.toHexString());
    return Entity._create(
      entityId,
      {
        entityType: raw.entityType,
        firstName: raw.firstName,
        lastName: raw.lastName,
        displayName: raw.displayName,
        personalNumber: !!raw.personalNumber ? 
          PersonalNumber.create(raw.personalNumber)._unsafeUnwrap() : undefined,
        identityCard: !!raw.identityCard ? 
          IdentityCard.create(raw.identityCard)._unsafeUnwrap() : undefined,
        rank: !!raw.rank ? 
          Rank.create(raw.rank)._unsafeUnwrap() : undefined,
        akaUnit: raw.akaUnit,
        clearance: raw.clearance,
        mail: !!raw.mail ? Mail.create(raw.mail)._unsafeUnwrap() : undefined, 
        sex: raw.sex,
        serviceType: !!raw.serviceType ? 
          ServiceType.create(raw.serviceType)._unsafeUnwrap() : undefined,
        dischargeDate: raw.dischargeDate,
        birthDate: raw.birthDate,
        jobTitle: raw.jobTitle,
        address: raw.address, // value
        phone: UniqueArray.fromArray((raw.phone || []).map(p => Phone.create(p)._unsafeUnwrap())),
        mobilePhone: UniqueArray.fromArray((raw.phone || []).map(p => MobilePhone.create(p)._unsafeUnwrap())),
        goalUserId: !!raw.goalUserId ? 
          DigitalIdentityId.create(raw.goalUserId)._unsafeUnwrap() : undefined,
        primaryDigitalIdentityId: !!raw.primaryDigitalIdentityId ? 
          DigitalIdentityId.create(raw.primaryDigitalIdentityId)._unsafeUnwrap() : undefined,
        profilePicture: !!raw.pictures?.profile ? {
          path: raw.pictures.profile.path,
          ...raw.pictures.profile.meta,
        } : undefined,
      },
      { isNew: false, savedVersion: raw.version },
    )._unsafeUnwrap();
  }
}
