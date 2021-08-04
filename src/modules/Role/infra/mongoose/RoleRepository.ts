import { Connection, Model } from "mongoose";
import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { Role } from "../../domain/Role";
import { RoleId } from "../../domain/RoleId";
import { RoleRepository as IRoleRepository } from "../../repository/RoleRepository"
import { RoleMapper as Mapper} from "./RoleMapper";
import { default as RoleSchema, RoleDoc } from "./RoleSchema";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";


const modelName = 'Role'; // TODO: get from config
export class RoleRepository implements IRoleRepository {
  private _model: Model<RoleDoc>;
  private _eventOutbox: EventOutbox;

  constructor(db: Connection, eventOutbox: EventOutbox) {
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, RoleSchema);
    }
    this._eventOutbox = eventOutbox;
  }

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
      await this._eventOutbox.put(role.domainEvents, session);
    });
    session.endSession();
  }
}
