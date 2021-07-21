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

export class RoleService {
  constructor(
    private roleRepository: RoleRepository,
    private groupRepository: GroupRepository,
    private diRepository: DigitalIdentityRepository
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

  async connectDigitalIdentity(connectDTO: ConnectDigitalIdentityDTO): Promise<Result<
    void, 
    AppError.ValueValidationError |
    AppError.ResourceNotFound |
    any // any role entity errors
  >> {
    const roleId = RoleId.create(connectDTO.roleId);
    const idOrError = DigitalIdentityId.create(connectDTO.digitalIdentityUniqueId)
      .mapErr(msg => AppError.ValueValidationError.create(msg));
    if(idOrError.isErr()) {
      return err(idOrError.error);
    }
    const role = await this.roleRepository.getByRoleId(roleId);
    if(!role) {
      return err(AppError.ResourceNotFound.create(connectDTO.roleId, 'role id'))
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
}