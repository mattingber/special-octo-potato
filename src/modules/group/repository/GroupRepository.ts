import { Result } from "neverthrow";
import { AggregateVersionError } from "../../../core/infra/AggregateVersionError";
import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Group } from "../domain/Group";
import { GroupId } from "../domain/GroupId";

export interface GroupRepository extends Repository<Group> {
  generateGroupId(): GroupId;
  save(group: Group): Promise<Result<void, AggregateVersionError>>;
  getByGroupId(groupId: GroupId): Promise<Group | null>;
}