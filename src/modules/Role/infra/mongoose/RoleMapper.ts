import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Role } from "../../domain/Role";
import { RoleId } from "../../domain/RoleId";
import { RoleDoc } from "./RoleSchema";
import { Source } from "../../../digitalIdentity/domain/Source";
import { Types } from "mongoose";

export class RoleMapper {

  static toPersistance(role: Role): RoleDoc {
    return {
      roleId: role.roleId.toString(),
      source: role.source.value,
      jobTitle: role.jobTitle,
      directGroup: Types.ObjectId(role.directGroup.toString()),
      digitalIdentityUniqueId: role.digitalIdentityUniqueId?.toString(),
    }
  }

  static toDomain(raw: RoleDoc): Role {
    const roleId = RoleId.create(raw.roleId);
    const di_uid = raw.digitalIdentityUniqueId;
    return Role._create(
      roleId,
      {
        directGroup:  GroupId.create(raw.directGroup.toHexString()),
        source: Source.create (raw.source)._unsafeUnwrap(),
        jobTitle: raw.jobTitle,
        digitalIdentityUniqueId: !!di_uid ? DigitalIdentityId.create(di_uid)._unsafeUnwrap() : undefined,
      },
      { isNew: false },
    );
  }
}
