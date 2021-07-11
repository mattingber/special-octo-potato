import { Model, Types } from "mongoose";
import { GroupRepository as IGroupRepository } from "../../repository/GroupRepository"
import { GroupMapper as Mapper} from "./GroupMapper";
import { GroupDoc } from "./GroupModel";
import { GroupId } from "../../domain/GroupId";
import { Group } from "../../domain/Group";

export class GroupRepository implements IGroupRepository {

  constructor(
    private _model: Model<GroupDoc> 
  ) {}

  generateGroupId(): GroupId {
    return  GroupId.create(new Types.ObjectId().toHexString());
  }

  async getByGroupId(groupId: GroupId): Promise<Group | null> {
    const raw = await this._model.findOne({ _id: groupId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain(raw);
  }

  async save(group: Group) {
    const persistanceState = Mapper.toPersistance(group);
    await this._model.updateOne(
      { _id: group.groupId.toString() }, 
      persistanceState, 
      { upsert: true }
    );
  }
}
