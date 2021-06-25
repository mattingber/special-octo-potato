import { Hierarchy } from "../../../../shared/Hierarchy";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Role } from "../../domain/Role";
import { RoleId } from "../../domain/RoleId";
import { RoleDoc } from "./RoleModel";

export class RoleMapper {

  static toPersistance(role: Role) {
    return {
      roleId: role.roleId.toString(),
      source: role.source,
      jobTitle: role.jobTitle,
      hierarchyIds: role.hierarchyIds.map(gId => gId.toString()),
      hierarchy: role.hierarchy,
      digitalIdentityUniqueId: role.digitalIdentityUniqueId?.toString(),
    }
  }

  static toDomain(raw: RoleDoc): Role {
    const roleId = RoleId.create(raw.roleId);
    const di_uid = raw.digitalIdentityUniqueId;
    return Role._create(
      roleId,
      {
        hierarchy: Hierarchy.create(raw.hierarchy),
        hierarchyIds: raw.hierarchyIds.map(gId => GroupId.create(gId)),
        source: raw.source,
        jobTitle: raw.jobTitle,
        digitalIdentityUniqueId: !!di_uid ? DigitalIdentityId.create(di_uid) : undefined,
      },
      { isNew: false },
    );
  }
}
