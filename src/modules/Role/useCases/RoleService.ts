import { RoleRepository } from "../repository/RoleRepository";
import { GroupRepository } from "../../group/repository/GroupRepository";
import { CreateRoleDTO } from "./dtos/CreateRoleDTO";
import { RoleId } from "../domain/RoleId";
import { Source } from "../../digitalIdentity/domain/Source";
import { Result, err, ok } from "neverthrow";
import { AppError } from "../../../core/logic/AppError";
import { GroupId } from "../../group/domain/GroupId";

export class RoleService {
  constructor(
    private roleRepository: RoleRepository,
    private groupRepository: GroupRepository
  ){}

  async createRole(createRoleDTO: CreateRoleDTO): Promise<Result<
    void, 
    AppError.ValueValidationError |
    AppError.ResourceNotFound
  >> {
    const roleId = RoleId.create(createRoleDTO.roleId);
    const sourceOrError = Source.create(createRoleDTO.source)
      .mapErr(msg => AppError.ValueValidationError.create(msg));
    if(sourceOrError.isErr()) {
      return err(sourceOrError.error);
    }
    const group = await this.groupRepository.getByGroupId(GroupId.create(createRoleDTO.directGroup));
    if(!group) {
      return err(AppError.ResourceNotFound.create(createRoleDTO.directGroup, 'group id'));
    }
    const role = group.createRole(roleId, {
      source: sourceOrError.value,
      jobTitle: createRoleDTO.jobTitle,
    });
    await this.roleRepository.save(role);
    return ok(undefined);
  }
}