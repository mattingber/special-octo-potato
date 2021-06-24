import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { GroupId } from "../../group/domain/GroupId";
import { Hierarchy } from "../../../shared/Hierarchy";
import { RoleId } from "./RoleId";
import { Group } from "../../group/domain/Group";
import { DigitalIdentity } from "../../digitalIdentity/domain/DigitalIdentity";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";

export interface RoleState {
  source: string;
  jobTitle?: string;
  hierarchyIds: GroupId[];
  hierarchy: Hierarchy;
  digitalIdentityUniqueId?: DigitalIdentityId
}

export class Role extends AggregateRoot {
  private _source: string;
  private _jobTitle: string;
  private _hierarchyIds: GroupId[];
  private _hierarchy: Hierarchy;
  private _digitalIdentityUniqueId?: DigitalIdentityId;

  private constructor(roleId: RoleId, props: RoleState) {
    super(roleId);
    const {
      source,
      hierarchyIds,
      hierarchy,
      jobTitle = '',
      digitalIdentityUniqueId,
    } = props;
    this._source = source;
    this._jobTitle = jobTitle;
    this._hierarchy = hierarchy;
    this._hierarchyIds = hierarchyIds;
    this._digitalIdentityUniqueId = digitalIdentityUniqueId;
  }

  public moveToGroup(group: Group) {
    this._hierarchy = Hierarchy.create(group.hierarchy);
    this._hierarchyIds = [...group.ancestors];
  }

  public connectDigitalIdentity(digitalIdentity: DigitalIdentity) {
    if (digitalIdentity.canConnectRole)
      this._digitalIdentityUniqueId = digitalIdentity.uniqueId;
    else 
      return; //error
  }

  public disconnectDigitalItendity() {
    this._digitalIdentityUniqueId = undefined;
  }

  // public static createRoleInGroup(
  //   roleId: RoleId, 
  //   props: {
  //     source: string;
  //     jobTitle?: string;
  //   },
  //   parentGroup: Group
  // ) {
  //   return new Role(
  //     roleId,
  //     {
  //       source: props.source,
  //       hierarchy: Hierarchy.create(parentGroup.hierarchy).concat(parentGroup.name),
  //       hierarchyIds: parentGroup.ancestors.concat([parentGroup.id]),
  //       jobTitle: props.jobTitle,
  //     }
  //   )
  // }

  public static _create(roleId: RoleId, state: RoleState, opts: { isNew: boolean }) {
    return new Role(roleId, state);
  }

  get source() {
    return this._source;
  }
  get jobTitle() {
    return this._jobTitle;
  }
  get digitalIdentityUniqueId() {
    return this._digitalIdentityUniqueId;
  }
  get roleId() {
    return RoleId.create(this.id.toValue());
  }
  get directGroup() {
    return this._hierarchyIds[0];
  }
  get hierarchyIds() {
    return this._hierarchyIds;
  }
  get hierarchy() {
    return this._hierarchy.value();
  }

}