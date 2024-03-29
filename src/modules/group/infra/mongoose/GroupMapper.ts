import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Group } from "../../domain/Group";
import { GroupDoc } from "./GroupSchema";
import { Types } from "mongoose";
import { Source } from "../../../digitalIdentity/domain/Source";

export class GroupMapper {

  static toPersistance(group: Group): GroupDoc {
    return {
      _id: Types.ObjectId(group.groupId.toString()),
      name: group.name,
      source: group.source.value,
      // ancestors: group.ancestors.map(ancestorId => Types.ObjectId(ancestorId.toString())),
      directGroup: !!group.parentId ? Types.ObjectId(group.parentId.toString()) : undefined,
      // hierarchy: group.hierarchy,
      akaUnit: group.akaUnit,
      status: group.status,
      version: group.version,
    }
  }

  static toDomain(
    raw: GroupDoc & { 
      ancestors: Types.ObjectId[],
      childrenNames: string[],
    } 
  ): Group {
    const groupId = GroupId.create(raw._id.toHexString());
    return Group._create(
      groupId,
      {
        name: raw.name,
        source: Source.create(raw.source)._unsafeUnwrap(),
        ancestors: raw.ancestors.map(ancestorId => GroupId.create(ancestorId.toHexString())),
        childrenNames: new Set(raw.childrenNames),
        akaUnit: raw.akaUnit,
        status: raw.status,
        // hierarchy: Hierarchy.create(raw.hierarchy),
      },
      { isNew: false, savedVersion: raw.version },
    );
  }
}
