import { DigitalIdentity, DigitalIdentityType } from "../../domain/DigitalIdentity";
import { DigitalIdentityId } from "../../domain/DigitalIdentityId";
import { DigitalIdentityDoc } from "./DigitalIdentityModel";
import { EntityId } from "../../../entity/domain/EntityId";
import { Types } from "mongoose";
import { Mail } from "../../domain/Mail";
import { Source } from "../../domain/Source";

export class DigitalIdentityMapper {

  static toPersistance(digitalIdentity: DigitalIdentity): DigitalIdentityDoc {
    return {
      uniqueId: digitalIdentity.uniqueId.toString(),
      type: digitalIdentity.type,
      source: digitalIdentity.source.value,
      mail: digitalIdentity.mail.value,
      isRoleAttachable: digitalIdentity.canConnectRole,
      entityId: Types.ObjectId(digitalIdentity.connectedEntityId?.toString()),
    }
  }

  static toDomain(raw: DigitalIdentityDoc): DigitalIdentity {
    const uid = DigitalIdentityId.create(raw.uniqueId)._unsafeUnwrap();
    const entityId = raw.entityId;
    return DigitalIdentity._create(
      uid,
      {
        mail: Mail.create(raw.mail)._unsafeUnwrap(),
        source: Source.create(raw.source)._unsafeUnwrap(),
        type: raw.type,
        canConnectRole: raw.isRoleAttachable,
        entityId: !!entityId ? EntityId.create(entityId.toHexString()) : undefined,
      },
      { isNew: false },
    )._unsafeUnwrap();
  }
}
