import { Hierarchy } from "../../../../shared/Hierarchy";
import { Types } from "mongoose";
import { EntityDoc } from "./entityModel";
import { Entity } from "../../domain/Entity";
import { EntityId } from "../../domain/EntityId";

export class EntityMapper {

  static toPersistance(entity: Entity): EntityDoc {
    return {
      _id: Types.ObjectId(entity.entityId.toString()),
      firstName: entity.name.firstName,
      lastName: entity.name.lastName,
      entityType: entity.entityType,
      hierarchy: entity.hierarchy,
      displayName: entity.displayName,
      personalNumber: entity.personalNumber, // use value object
      identityCard: entity.identityCard,
      rank: entity.rank, //use vale object / enum
      akaUnit: entity.akaUnit,
      clearance: entity.clearance, // value object
      mail: entity.mail, //value object
      sex: entity.sex,
      serviceType: entity.serviceType, //value object
      dischargeDate: entity.dischargeDate,
      birthDate: entity.birthDate,
      jobTitle: entity.jobTitle,
      address: entity.address, // value
      phone: entity.phone, //value object
      mobilePhone: entity.mobilePhone, //value object
      goalUserId: entity.goalUserId,
    }
  }

  static toDomain(raw: EntityDoc): Entity {
    const entityId = EntityId.create(raw._id.toHexString());
    return Entity.create(
      entityId,
      {
        entityType: raw.entityType,
        firstName: raw.firstName,
        lastName: raw.lastName,
        hierarchy: !!raw.hierarchy ? Hierarchy.create(raw.hierarchy) : undefined,
        displayName: raw.displayName,
        personalNumber: raw.personalNumber, // use value object
        identityCard: raw.identityCard,
        rank: raw.rank,
        akaUnit: raw.akaUnit,
        clearance: raw.clearance,
        mail: raw.mail, //value object
        sex: raw.sex,
        serviceType: raw.serviceType, //value object
        dischargeDate: raw.dischargeDate,
        birthDate: raw.birthDate,
        jobTitle: raw.jobTitle,
        address: raw.address, // value
        phone: new Set(raw.phone), //value object
        mobilePhone: new Set(raw.mobilePhone), //value object
        goalUserId: raw.goalUserId,
      },
      { isNew: false },
    )._unsafeUnwrap();
  }
}
