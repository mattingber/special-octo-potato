import { GroupId } from "./GroupId";
import { Source } from "../../digitalIdentity/domain/Source";

export interface IGroup {
  name: string;
  source: Source; // TODO: value object. 
  akaUnit?: string;
  // hierarchy: string;
  ancestors: GroupId[];
  groupId: GroupId;
  status?: string;
  isLeaf: boolean;
}