import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
import { RoleId } from "../RoleId";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Hierarchy } from "../../../../shared/Hierarchy";

type RoleEventPayload = {
  roleId: RoleId;
  disconnectedDigitalIdentityId: DigitalIdentityId;
  jobTitle?: string;
  hierarchyIds: GroupId[];
  hierarchy: Hierarchy;
}

export class RoleDisconnectedEvent extends DomainEvent<RoleEventPayload> {
  toPlainObject(): object {
    const {
      roleId, disconnectedDigitalIdentityId, jobTitle, hierarchy, hierarchyIds,
    } = this.payload;
    return {
      roleId: roleId.toString(),
      disconnectedDigitalIdentityId: disconnectedDigitalIdentityId.toString(),
      hierarchy: hierarchy.value(),
      hierarchyIds: hierarchyIds.map(id => id.toString()),
      ...!!jobTitle && { jobTitle },
    };
  }

  get roleId() {
    return this.payload.roleId;
  }
  get disconnectedDigitalIdentityId() {
    return this.payload.disconnectedDigitalIdentityId;
  }
  get hierarchyIds() {
    return this.payload.hierarchyIds;
  }
  get hierarchy() {
    return this.payload.hierarchy;
  }
  get jobTitle() {
    return this.payload.jobTitle;
  }
}