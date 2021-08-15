import { AggregateRoot, CreateOpts } from "../../../core/domain/AggregateRoot";
import { GroupId } from "../../group/domain/GroupId";
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
  directGroup: GroupId;
  digitalIdentityUniqueId?: DigitalIdentityId;
  // TODO: add clearance field?
  // hierarchyIds: GroupId[];
  // hierarchy: Hierarchy;
};

type UpdateDto = {
  jobTitle: string;
};

type CreateNewRoleProps =  Omit<RoleState, 'didigitalIdentityUniqueId'> & {
  connectedDigitalIdentity: DigitalIdentity;
}

export class Role extends AggregateRoot {
  private _source: Source;
  private _jobTitle: string;
  private _directGroup: GroupId;
  // private _hierarchyIds: GroupId[];
  // private _hierarchy: Hierarchy;
  private _digitalIdentityUniqueId?: DigitalIdentityId;

  private constructor(roleId: RoleId, props: RoleState, opts: CreateOpts) {
    super(roleId, opts);
    const {
      source,
      directGroup,
      jobTitle = '',
      digitalIdentityUniqueId,
    } = props;
    this._source = source;
    this._jobTitle = jobTitle;
    this._directGroup = directGroup;
    this._digitalIdentityUniqueId = digitalIdentityUniqueId;
  }

  public moveToGroup(group: IGroup) {
    this.addDomainEvent(new RoleMovedGroupEvent(this.id, {
      roleId: this.roleId,
      connectedDigitalIdentityId: this._digitalIdentityUniqueId,
      directGroup: group.groupId,
      jobTitle: this._jobTitle,
      // hierarchy: this._hierarchy,
      // hierarchyIds: this._hierarchyIds,
    }));
    // this._hierarchy = Hierarchy.create(group.hierarchy);
    // this._hierarchyIds = group.ancestors;
    this._directGroup = group.groupId;
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
        jobTitle: this._jobTitle,
        directGroup: this._directGroup,
        // hierarchy: this._hierarchy,
        // hierarchyIds: this._hierarchyIds,
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
        jobTitle: this._jobTitle,
        directGroup: this._directGroup,
        // hierarchy: this._hierarchy,
        // hierarchyIds: this._hierarchyIds,
      }));
    }
    this._digitalIdentityUniqueId = undefined;
  }

  public updateJob(jobTitle: string) {
    this._jobTitle = jobTitle;
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
    return new Role(roleId, state, opts);
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
    return this._directGroup;
  }
  // get hierarchyIds() {
  //   return this._hierarchyIds;
  // }
  // get hierarchy() {
  //   return this._hierarchy.value();
  // }

}