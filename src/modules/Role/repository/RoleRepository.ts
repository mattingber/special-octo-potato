import { Result } from "neverthrow";
import { AggregateVersionError } from "../../../core/infra/AggregateVersionError";
import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Role } from "../domain/Role";
import { RoleId } from "../domain/RoleId";

export interface RoleRepository extends Repository<Role> {
  save(role: Role): Promise<Result<void, AggregateVersionError>>;
  getByRoleId(roleId: RoleId): Promise<Role | null>;
  getByDigitalIdentityId(digitalIdentityUniqueId: DigitalIdentityId): Promise<Role | null>;
}