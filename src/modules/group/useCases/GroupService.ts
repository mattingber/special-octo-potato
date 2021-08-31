import { GroupRepository } from "../repository/GroupRepository";
import { CreateGroupDTO } from "./dto/CreateGroupDTO";
import { Source } from "../../digitalIdentity/domain/Source";
import { AppError } from "../../../core/logic/AppError";
import { err, ok, Result } from "neverthrow";
import { GroupId } from "../domain/GroupId";
import { has } from "../../../utils/ObjectUtils";
import { Group } from "../domain/Group";
import { DuplicateChildrenError } from "../domain/errors/DuplicateChildrenError";
import { MoveGroupDTO } from "./dto/MoveGroupDTO";
import { TreeCycleError } from "../domain/errors/TreeCycleError";
import { GroupResultDTO, groupToDTO } from "./dto/GroupResultDTO";
import { IsNotLeafError } from "../domain/errors/IsNotLeafError";
import { BaseError } from "../../../core/logic/BaseError";
import { RoleRepository } from "../../Role/repository/RoleRepository";
import { HasRolesAttachedError } from "../domain/errors/HasRolesAttachedError";

export class GroupService {
  constructor(
    private groupRepository: GroupRepository,
    private roleRepository: RoleRepository
  ) {}

  async createGroup(createDTO: CreateGroupDTO): Promise<Result<
    GroupResultDTO,
    AppError.ValueValidationError |
    AppError.ResourceNotFound |
    AppError.RetryableConflictError |
    DuplicateChildrenError
  >> {
    const source = Source.create(createDTO.source)
      .mapErr(AppError.ValueValidationError.create);
    if(source.isErr()) { return err(source.error); }
    let group: Result<Group, DuplicateChildrenError>;
    const groupId = this.groupRepository.generateGroupId();
    if(has(createDTO, 'directGroup')) {
      const parentId = GroupId.create(createDTO.directGroup);
      const parent = await this.groupRepository.getByGroupId(parentId);
      if(!parent) { 
        return err(AppError.ResourceNotFound.create(createDTO.directGroup, 'group')); 
      }
      group = parent.createChild(
        groupId, {
          source: source.value,
          name: createDTO.name,
          akaUnit: createDTO.akaUnit,
        }
      );
    } else {
      group = ok(Group.createRoot(
        groupId, {
          name: createDTO.name,
          source: source.value,
          akaUnit: createDTO.akaUnit
        }
      ));
    }
    if(group.isErr()) { return err(group.error); }
    return (await this.groupRepository.save(group.value))
      .map(() => groupToDTO(group._unsafeUnwrap())) // TODO why the fuck TS doesn't recognize the correct type
      .mapErr(err => AppError.RetryableConflictError.create(err.message));
  }

  async moveGroup(moveGroupDTO: MoveGroupDTO): Promise<Result<
    void,
    AppError.ResourceNotFound | 
    AppError.RetryableConflictError |
    DuplicateChildrenError | 
    TreeCycleError
  >> {
    const groupId = GroupId.create(moveGroupDTO.groupId);
    const parentId = GroupId.create(moveGroupDTO.parentId);
    const group = await this.groupRepository.getByGroupId(groupId);
    if(!group) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.groupId, 'group'));
    }
    const parent = await this.groupRepository.getByGroupId(parentId);
    if(!parent) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.parentId, 'parent group'));
    }
    const result = group.moveToParent(parent);
    if(result.isErr()) {
      return err(result.error);
    }
    return (await this.groupRepository.save(group))
      .mapErr(err => AppError.RetryableConflictError.create(err.message));
  }

  // TODO: update group (rename)

  async deleteGroup(id: string): Promise<Result<any,BaseError>>{ 
    const groupId = GroupId.create(id);
    const group = await this.groupRepository.getByGroupId(groupId)
    if(!group) {
      return err(AppError.ResourceNotFound.create(id, 'Group'));
    }
    if(group.childrenNames.length != 0){
      return err(IsNotLeafError.create(id));
    }
    const role = await this.roleRepository.getByGroupId(groupId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(id, 'Role'));
    }
    if(!!role){
      return err(HasRolesAttachedError.create(id));
    }
    return (await this.groupRepository.delete(groupId)).mapErr(err => AppError.RetryableConflictError.create(err.message));
  }
}