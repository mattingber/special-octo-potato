import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Group } from "../domain/Group";
import { GroupId } from "../domain/GroupId";

export interface GroupRepository extends Repository<Group> {
  generateGroupId(): GroupId;
  save(digitalIdentity: Group): Promise<void>;
  getByGroupId(groupId: GroupId): Promise<Group | null>;
}