import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
import { GroupId } from "../GroupId";
import { Hierarchy } from "../../../../shared/Hierarchy";

type GroupEventPayload = {
  previousParentId?: GroupId;
  groupId: GroupId;
  name: string;
  source: string; // TODO: value object. 
  akaUnit?: string;
  hierarchy: Hierarchy;
  ancestors: GroupId[];
  status?: string;
}

export class GroupMovedToParentEvent extends DomainEvent<GroupEventPayload> {
  toPlainObject(): object {
    const {
      groupId, name, source, akaUnit, ancestors, hierarchy, status, previousParentId
    } = this.payload;

    return {
      name,
      source,
      hierarchy,
      ancestors,
      groupId: groupId.toString(),
      ...!!akaUnit && { akaUnit },
      ...!!status && { status },
      ...!!previousParentId && { previousParentId: previousParentId.toString() },
    };
  }

  get groupId() {
    return this.payload.groupId;
  }
  get name() {
    return this.payload.name;
  }
  get source() {
    return this.payload.source;
  }
  get akaUnit() {
    return this.payload.akaUnit;
  }
  get hierarchy() {
    return this.payload.hierarchy;
  }
  get ancestors() {
    return this.payload.ancestors;
  }
  get status() {
    return this.payload.status;
  }
  get previousParentId() {
    return this.payload.previousParentId;
  }

}