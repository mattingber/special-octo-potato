import { Model, Types } from "mongoose";
import { GroupRepository as IGroupRepository } from "../../repository/GroupRepository"
import { GroupMapper as Mapper} from "./GroupMapper";
import { GroupDoc } from "./GroupModel";
import { GroupId } from "../../domain/GroupId";
import { Group } from "../../domain/Group";
import { Outbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";

export class GroupRepository implements IGroupRepository {

  constructor(
    private _model: Model<GroupDoc>,
    private _outbox: Outbox
  ) {}

  generateGroupId(): GroupId {
    return GroupId.create(new Types.ObjectId().toHexString());
  }
  
  async getByGroupId(groupId: GroupId): Promise<Group | null> {
    const [raw, ancestors] = await Promise.all([
      this._model.findOne({ _id: groupId.toString() }).lean(),
      this.calculateAncestors(groupId)
    ])
    // const raw = await this._model.findOne({ _id: groupId.toString() }).lean();
    if (!raw) return null;
    return Mapper.toDomain({ ...raw, ancestors });
  }

  private async calculateAncestors(groupId: GroupId) {
    const res = await this._model.aggregate([
      { $match: { _id: groupId.toString() } },
      {
        $graphLookup: {
          from: 'groups',
          startWith: '$directGroup',
          connectFromField: 'directGroup',
          connectToField: '_id',
          as: 'ancestors',
          depthField: 'searchDepth'
        }
      },
      { $unwind: '$ancestors' },
      { $sort: { searchDepth: 1 } },
      { $project: {} } // TODO: does it work?
    ]);
    return res.map(doc => doc._id) as Types.ObjectId[];
  }

  async save(group: Group) {
    const persistanceState = Mapper.toPersistance(group);
    const session = await this._model.startSession();
    await session.withTransaction(async () => {
      await this._model.updateOne(
        { _id: group.groupId.toString() }, 
        persistanceState, 
        { upsert: true }
      ).session(session);
      await this._outbox.put(group.domainEvents, session);
    });
    session.endSession();
  }
}
