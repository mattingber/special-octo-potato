import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { GroupId } from "./GroupId";
import { Hierarchy } from "../../../shared/Hierarchy";

type RootGroupProps = {
  name: string;
  // source: string;
  akaUnit?: string;
}

type ChildGroupProps = RootGroupProps & {
  parent: Group;
}

interface GroupProps {
  name: string;
  akaUnit?: string;
  hierarchy?: Hierarchy;
  ancestors?: GroupId[];
  status?: string;
}

export class Group extends AggregateRoot {

  private _name: string;
  private _akaUnit? : string; // maybe value object
  private _status: string; // maybe value object
  private _ancestors: GroupId[];
  private _hierarchy: Hierarchy;
  private _childrenCount = 0; // maybe a read model concern (isLeaf)

  private constructor(id: GroupId, props: GroupProps) {
    super(id);
    this._name = props.name;
    this._akaUnit = props.akaUnit;
    this._status = props.status || 'active';
    this._hierarchy = props.hierarchy || Hierarchy.create('');
    this._ancestors = props.ancestors || [];
    
  }

  public moveToParent(parent: Group) {
    this._ancestors = [ parent.id, ...parent._ancestors ];
    this._hierarchy = Hierarchy.create(parent.hierarchy).concat(parent.name);
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
  get name() {
    return this._name;
  }
  get isLeaf() {
    return this._childrenCount === 0;
  }
  get hierarchy() {
    return this._hierarchy.value();
  }
  get ancestors() {
    return [...this._ancestors]
  }
  get akaUnit() {
    return this._akaUnit;
  }
  get status() {
    return this._status;
  }

  static createRoot(groupId: GroupId, props: RootGroupProps) {
    return Group._create(groupId, props)
  }

  static createChild(groupId: GroupId, props: ChildGroupProps) {
    const child = Group._create(groupId, {
      name: props.name,
      akaUnit: props.akaUnit
    });
    child.moveToParent(props.parent);
    return child;
  }

  static _create(groupId: GroupId, props: GroupProps): Group {
    // validate hierarchy & ancestors
    return new Group(groupId, props);
  }
}
