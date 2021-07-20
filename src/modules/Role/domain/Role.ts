import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { GroupId } from "../../group/domain/GroupId";
import { Hierarchy } from "../../../shared/Hierarchy";
import { RoleId } from "./RoleId";
import { DigitalIdentity } from "../../digitalIdentity/domain/DigitalIdentity";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import { Result, ok, err } from "neverthrow";
import { DigitalIdentityCannotBeConnected } from "./errors/DigitalIdentityCannotBeConnected";
import { IGroup } from "../../group/domain/IGroup";
import { RoleConnectedEvent } from "./events/RoleConnectedEvent";
import { AlreadyConnectedToDigitalIdentity } from "./errors/AlreadyConnectedToDigitalIdentity";
import { RoleDisconnectedEvent } from "./events/RoleDisconnectedEvent";
import { RoleMovedGroupEvent } from "./events/RoleMovedGroupEvent";
import { Source } from "../../digitalIdentity/domain/Source";

export interface RoleState {
  source: Source;
  jobTitle?: string;
  hierarchyIds: GroupId[];
  hierarchy: Hierarchy;
  digitalIdentityUniqueId?: DigitalIdentityId
}

type CreateNewRoleProps =  Omit<RoleState, 'didigitalIdentityUniqueId'> & {
  connectedDigitalIdentity: DigitalIdentity;
}

export class Role extends AggregateRoot {
  private _source: Source;
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

  public moveToGroup(group: IGroup) {
    this.addDomainEvent(new RoleMovedGroupEvent(this.id, {
      roleId: this.roleId,
      connectedDigitalIdentityId: this._digitalIdentityUniqueId,
      hierarchy: this._hierarchy,
      hierarchyIds: this._hierarchyIds,
      jobTitle: this._jobTitle,
    }));
    this._hierarchy = Hierarchy.create(group.hierarchy);
    this._hierarchyIds = group.ancestors;
  }

  public connectDigitalIdentity(
    digitalIdentity: DigitalIdentity
  ): Result<void, DigitalIdentityCannotBeConnected | AlreadyConnectedToDigitalIdentity> {
    if (!!this._digitalIdentityUniqueId) {
      return err(AlreadyConnectedToDigitalIdentity.create(
        this.roleId.toString(), 
        this._digitalIdentityUniqueId.toString()
      ));
    }
    if (digitalIdentity.canConnectRole){
      this._digitalIdentityUniqueId = digitalIdentity.uniqueId;
      this.addDomainEvent(new RoleConnectedEvent(this.id, {
        roleId: this.roleId,
        connectedDigitalIdentityId: this._digitalIdentityUniqueId,
        hierarchy: this._hierarchy,
        hierarchyIds: this._hierarchyIds,
        jobTitle: this._jobTitle,
      }));
      return ok(undefined);
    }
    return err(
      DigitalIdentityCannotBeConnected.create(digitalIdentity.uniqueId.toString())
    );
  }

  public disconnectDigitalIdentity() {
    if (!!this._digitalIdentityUniqueId) {
      this.addDomainEvent(new RoleDisconnectedEvent(this.id, {
        disconnectedDigitalIdentityId: this._digitalIdentityUniqueId,
        roleId: this.roleId,
        hierarchy: this._hierarchy,
        hierarchyIds: this._hierarchyIds,
        jobTitle: this._jobTitle,
      }));
    }
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

  public static _create(roleId: RoleId, state: RoleState, opts: CreateOpts) {
    return new Role(roleId, state);
  }

  public static createNew(roleId: RoleId, state: Omit<RoleState, 'digitalIdentityUniqueId'>) {
    return Role._create(roleId, state, { isNew: true });
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