import { RoleRepository } from "../repository/RoleRepository";
import { GroupRepository } from "../../group/repository/GroupRepository";
import { CreateRoleDTO } from "./dtos/CreateRoleDTO";
import { RoleId } from "../domain/RoleId";
import { Source } from "../../digitalIdentity/domain/Source";
import { Result, err, ok } from "neverthrow";
import { AppError } from "../../../core/logic/AppError";
import { GroupId } from "../../group/domain/GroupId";
import { ConnectDigitalIdentityDTO } from "./dtos/ConnectDigitalIdentityDTO";
import { DigitalIdentityRepository } from "../../digitalIdentity/repository/DigitalIdentityRepository";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { UpdateRoleDTO } from "./dtos/UpdateRoleDTO";
import { DigitalIdentity } from "../../digitalIdentity/domain/DigitalIdentity";
import { MoveGroupDTO } from "./dtos/MoveGroupDTO";

export class RoleService {
  constructor(
    private roleRepository: RoleRepository,
    private groupRepository: GroupRepository,
    private diRepository: DigitalIdentityRepository
  ){}

  /**
   * Create a new Role under a group
   * @param createRoleDTO 
   */
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

  /**
   * Connect Role to a Digital Identity
   * @param connectDTO 
   */
  async connectDigitalIdentity(connectDTO: ConnectDigitalIdentityDTO): Promise<Result<
    void, 
    AppError.ValueValidationError |
    AppError.ResourceNotFound |
    any // any role entity errors
  >> {
    const roleId = RoleId.create(connectDTO.roleId);
    const idOrError = DigitalIdentityId.create(connectDTO.digitalIdentityUniqueId)
      .mapErr(msg => AppError.ValueValidationError.create(msg));
    if(idOrError.isErr()) { // invalid DI unique id value provided
      return err(idOrError.error);
    }
    const role = await this.roleRepository.getByRoleId(roleId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(connectDTO.roleId, 'role id'));
    }
    const di = await this.diRepository.getByUniqueId(idOrError.value);
    if(!di) {
      return err(AppError.ResourceNotFound.create(
        connectDTO.digitalIdentityUniqueId, 
        'digitalIdentity UniqueId'
      ));
    }
    const res = role.connectDigitalIdentity(di);
    if(res.isErr()) {
      return err(res.error);
    }
    await this.roleRepository.save(role);
    return ok(undefined);
  }

  /**
   * Disconnect a Role from a Digital Identity
   * @param disconnectDTO 
   */
  async disconnectDigitalIdentity(disconnectDTO: ConnectDigitalIdentityDTO): Promise<Result<
    void,
    AppError.ResourceNotFound |
    AppError.ValueValidationError |
    any
  >> {
    const roleId = RoleId.create(disconnectDTO.roleId);
    const uidOrError = DigitalIdentityId.create(disconnectDTO.digitalIdentityUniqueId)
      .mapErr(msg => AppError.ValueValidationError.create(msg));
    if(uidOrError.isErr()) { // invalid DI unique id value provided
      return err(uidOrError.error);
    }
    const role = await this.roleRepository.getByRoleId(roleId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(disconnectDTO.roleId, 'role'));
    }
    if(!role.digitalIdentityUniqueId?.equals(uidOrError.value)) {
      // TODO: error
    }
    role.disconnectDigitalIdentity();
    return ok(undefined);
  }

  /**
   * Update fields of a Role.

   * currently UpdateDTO = `{
     jobTitle: string
   }`
   * @param updateDTO 
   */
  async updateRole(updateDTO: UpdateRoleDTO): Promise<Result<void, AppError.ResourceNotFound>> {
    const roleId = RoleId.create(updateDTO.roleId)
    const role = await this.roleRepository.getByRoleId(roleId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(updateDTO.roleId, 'role id'));
    }
    await this.roleRepository.save(role);
    return ok(undefined);
  }

  /**
   * Move a Role to a new Group
   * @param moveGroupDTO 
   */
  async moveToGroup(moveGroupDTO: MoveGroupDTO): Promise<Result<
    void,
    AppError.ResourceNotFound
  >> {
    const roleId = RoleId.create(moveGroupDTO.roleId);
    const groupId = GroupId.create(moveGroupDTO.groupId);
    const role = await this.roleRepository.getByRoleId(roleId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.roleId, 'role'));
    }
    const group = await this.groupRepository.getByGroupId(groupId);
    if(!group) {
      return err(AppError.ResourceNotFound.create(moveGroupDTO.groupId, 'group'));
    }
    role.moveToGroup(group);
    await this.roleRepository.save(role);
    return ok(undefined);
  }

}
