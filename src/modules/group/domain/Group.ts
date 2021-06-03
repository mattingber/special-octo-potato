import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { GroupId } from "./GroupId";

interface GroupProps {
  name: string;
  akaUnit?: string;
  parent?: Group;
  status?: string;
}

export class Group extends AggregateRoot {

  private _name: string;
  private _parentId?: GroupId;
  private _akaUnit? : string; // maybe value object
  private _status: string; // maybe value object
  private _ancestors: GroupId[] = [];
  private _hierarchy: string = ''; // maybe value object
  private _childrenCount = 0;

  private constructor(id: GroupId, props: GroupProps) {
    super(id);
    this._name = props.name;
    this._akaUnit = props.akaUnit;
    this._parentId = props.parent?.id;
    this._status = props.status || 'active';
    if (props.parent) {
      this.moveToParent(props.parent);
    }
  }

  public moveToParent(parent: Group) {
    this._ancestors = [ parent.id, ...parent._ancestors ];
    this._hierarchy = parent._hierarchy + '/' + this._name;
  }

  public addChild() {
    this._childrenCount++;
  }

  public removeChild() {
    this._childrenCount--;
  }

  get id(): GroupId {
    return GroupId.create(this.id.toValue());
  }
  get isLeaf() {
    return this._childrenCount === 0;
  }
  get hierarchy() {
    return this._hierarchy;
  }
  get ancestors() {
    return this._ancestors;
  }
  get parentId() {
    return this._parentId;
  }
  get akaUnit() {
    return this._akaUnit;
  }
}