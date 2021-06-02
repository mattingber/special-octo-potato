import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { GroupId } from "./GroupId";

interface GroupProps {
  name: string;
  akaUnit?: string;
}

export class Group extends AggregateRoot {

  private _name: string;
  private _parentId: GroupId;
  private _akaUnit? : string; //maybe value object

  private constructor(id: GroupId) {
    super(id);
  }
}