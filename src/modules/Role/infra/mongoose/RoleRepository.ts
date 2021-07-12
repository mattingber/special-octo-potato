import { Model } from "mongoose";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { Role } from "../../domain/Role";
import { RoleId } from "../../domain/RoleId";
import { RoleRepository as IRoleRepository } from "../../repository/RoleRepository"
import { RoleMapper as Mapper} from "./RoleMapper";
import { RoleDoc } from "./RoleModel";
import { Outbox } from "../../../../shared/infra/mongoose/eventOutbox/OutBox";

export class RoleRepository implements IRoleRepository {

  constructor(
    private _model: Model<RoleDoc>,
    private _outbox: Outbox,
  ) {}

  async getByRoleId(roleId: RoleId): Promise<Role | null> {
    const raw = await this._model.findOne({ roleId: roleId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async getByDigitalIdentityId(digitalIdentityUniqueId: DigitalIdentityId): Promise<Role | null> {
    const raw = await this._model.findOne({ 
      digitalIdentityUniqueId: digitalIdentityUniqueId.toString(),
    }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async save(role: Role) {
    const persistanceState = Mapper.toPersistance(role);
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      await this._model.updateOne(
        { roleId: persistanceState.roleId }, 
        persistanceState, 
        { upsert: true }
      ).session(session);
      await this._outbox.put(role.domainEvents, session);
    });
    session.endSession();
  }
}
