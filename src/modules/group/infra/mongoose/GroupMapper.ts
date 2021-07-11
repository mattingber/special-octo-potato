import { Hierarchy } from "../../../../shared/Hierarchy";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Group } from "../../domain/Group";
import { GroupDoc } from "./GroupModel";
import { Types } from "mongoose";

export class GroupMapper {

  static toPersistance(group: Group): GroupDoc {
    return {
      _id: Types.ObjectId(group.groupId.toString()),
      name: group.name,
      source: group.source,
      ancestors: group.ancestors.map(ancestorId => Types.ObjectId(ancestorId.toString())),
      directGroup: Types.ObjectId(group.parentId.toString()),
      hierarchy: group.hierarchy,
      childrenNames: group.childrenNames,
      akaUnit: group.akaUnit,
      status: group.status,
    }
  }

  static toDomain(raw: GroupDoc): Group {
    const groupId = GroupId.create(raw._id.toHexString());
    return Group._create(
      groupId,
      {
        name: raw.name,
        source: raw.source,
        ancestors: raw.ancestors.map(ancestorId => GroupId.create(ancestorId.toHexString())),
        childrenNames: new Set(raw.childrenNames),
        akaUnit: raw.akaUnit,
        status: raw.status,
        hierarchy: Hierarchy.create(raw.hierarchy),
      },
      { isNew: false },
    );
  }
}
