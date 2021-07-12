import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { GroupId } from "./GroupId";
import { Hierarchy } from "../../../shared/Hierarchy";
import { RoleId } from "../../Role/domain/RoleId";
import { RoleState, Role } from "../../Role/domain/Role";
import { Result, err, ok } from "neverthrow";
import { DuplicateChildrenError } from "./errors/DuplicateChildrenError";

type CreateGroupProps = {
  name: string;
  source: string;
  akaUnit?: string;
}

type ChildGroupProps = CreateGroupProps & {
  parent: Group;
}

interface GroupState {
  name: string;
  source: string; // todo: value object. 
  akaUnit?: string;
  hierarchy?: Hierarchy;
  ancestors?: GroupId[];
  status?: string;
  childrenNames?: Set<string>;
}

export class Group extends AggregateRoot {

  private _name: string;
  private _akaUnit? : string; // maybe value object
  private _status: string; // maybe value object
  private _ancestors: GroupId[];
  private _hierarchy: Hierarchy;
  private _source: string;
  private _childrenNames: Set<string>;

  private constructor(id: GroupId, state: GroupState) {
    super(id);
    this._name = state.name;
    this._akaUnit = state.akaUnit;
    this._source = state.source;
    this._status = state.status || 'active';
    this._hierarchy = state.hierarchy || Hierarchy.create('');
    this._ancestors = state.ancestors || [];
    this._childrenNames = state.childrenNames || new Set();
  }

  public moveToParent(parent: Group): Result<void, DuplicateChildrenError> {
    if(parent._childrenNames.has(this._name)) {
      return err(DuplicateChildrenError.create(this._name, this.hierarchy));
    }
    this._ancestors = [ parent.id, ...parent._ancestors ];
    this._hierarchy = createChildHierarchy(parent);
    return ok(undefined);
  }

  public addChild(child: Group) {
    this._childrenNames.add(child.name);
  }

  public removeChild(child: Group) {
    this._childrenNames.delete(child.name);
  }

  get groupId(): GroupId {
    return GroupId.create(this.id.toValue());
  }
  get name() {
    return this._name;
  }
  get isLeaf() {
    return this._childrenNames.size === 0;
  }
  get hierarchy() {
    return this._hierarchy.value();
  }
  get ancestors() {
    return [...this._ancestors]
  }
  get parentId() {
    return this.ancestors[0];
  }
  get akaUnit() {
    return this._akaUnit;
  }
  get status() {
    return this._status;
  }
  get source() {
    return this._source;
  }
  get childrenNames() {
    return Array.from(this._childrenNames);
  }
  
  public createChild(groupId: GroupId, props: CreateGroupProps): Result<Group, DuplicateChildrenError> {
    if(this._childrenNames.has(props.name)) {
      return err(DuplicateChildrenError.create(props.name, this.hierarchy));
    }
    const child = Group._create(
      groupId, 
      {
        name: props.name,
        akaUnit: props.akaUnit,
        source: props.source,
      },
      { isNew: true }
    );
    child.moveToParent(this);
    return ok(child);
  }

  public createRole(roleId: RoleId, props: Omit<RoleState, 'hierarchyIds' | 'hierarchy'>) {
    return Role._create(
      roleId,
      {
        ...props,
        hierarchy: createChildHierarchy(this),
        hierarchyIds: this.ancestors,
      },
      { isNew: true }
    );
  }
  
  static createRoot(groupId: GroupId, props: CreateGroupProps) {
    return Group._create(groupId, props, { isNew: true })
  }

  static _create(groupId: GroupId, state: GroupState, opts: CreateOpts): Group {
    // validate hierarchy & ancestors
    return new Group(groupId, state);
  }
}

/*
 * helpers
 */

const createChildHierarchy = (parent: Group) => Hierarchy.create(parent.hierarchy).concat(parent.name);