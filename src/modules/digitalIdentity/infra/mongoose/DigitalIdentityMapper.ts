import { DigitalIdentity } from "../../domain/DigitalIdentity";
import { DigitalIdentityId } from "../../domain/DigitalIdentityId";

export class DigitalIdentityMapper {

  static toPersistance(digitalIdentity: DigitalIdentity) {
    return {
      uniqueId: digitalIdentity.uniqueId.toString(),
      type: digitalIdentity.type,
      source: digitalIdentity.source,
      mail: digitalIdentity.mail,
      canConnectRole: digitalIdentity.canConnectRole,
      entityId: digitalIdentity.connectedEntityId?.toString(),
    }
  }

  static toDoamin(raw: any): DigitalIdentity {
    const di = DigitalIdentity._create(
      DigitalIdentityId.create()
    )
  }
}
