import { Collection, Connection, default as mongoose ,Model, Types } from "mongoose";
import { GroupRepository as IGroupRepository } from "../../repository/GroupRepository"
import { GroupMapper as Mapper} from "./GroupMapper";
import { default as GroupSchema, GroupDoc } from "./GroupSchema";
import { GroupId } from "../../domain/GroupId";
import { Group } from "../../domain/Group";
import { EventOutbox } from "../../../../shared/infra/mongoose/eventOutbox/Outbox";


const modelName = 'Group'; // TODO: get from config
export class GroupRepository implements IGroupRepository {

  private _model: Model<GroupDoc>;
  private _eventOutbox: EventOutbox;

  constructor(db: Connection, eventOutbox: EventOutbox) {
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName);
    } else {
      this._model = db.model(modelName, GroupSchema);
    }
    this._eventOutbox = eventOutbox;
  }

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
      { $project: { _id: 1 } } // TODO: does it work?
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
      await this._eventOutbox.put(group.domainEvents, session);
    });
    session.endSession();
  }
}
