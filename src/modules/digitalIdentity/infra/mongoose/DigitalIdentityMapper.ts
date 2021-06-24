import { DigitalIdentity, DigitalIdentityType } from "../../domain/DigitalIdentity";
import { DigitalIdentityId } from "../../domain/DigitalIdentityId";
import { DigitalIdentityDoc } from "./DigitalIdentityModel";
import { EntityId } from "../../../entity/domain/EntityId";

export class DigitalIdentityMapper {

  static toPersistance(digitalIdentity: DigitalIdentity) {
    return {
      uniqueId: digitalIdentity.uniqueId.toString(),
      type: digitalIdentity.type,
      source: digitalIdentity.source,
      mail: digitalIdentity.mail,
      isRoleAttachable: digitalIdentity.canConnectRole,
      entityId: digitalIdentity.connectedEntityId?.toString(),
    }
  }

  static toDomain(raw: DigitalIdentityDoc): DigitalIdentity {
    const uid = DigitalIdentityId.create(raw.uniqueId);
    const entityId = raw.entityId;
    return DigitalIdentity._create(
      uid,
      {
        mail: raw.mail,
        source: raw.source,
        type: raw.type,
        canConnectRole: raw.isRoleAttachable,
        entityId: !!entityId ? EntityId.create(entityId.toHexString()) : undefined,
      },
      { isNew: false },
    );
  }
}
