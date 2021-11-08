import { GroupId } from "./GroupId";
import { Source } from "../../digitalIdentity/domain/Source";

export interface IGroup {
  name: string;
  source: Source; 
  akaUnit?: string;
  // hierarchy: string;
  diPrefix?: string;
  ancestors: GroupId[];
  groupId: GroupId;
  status?: string;
  isLeaf: boolean;
}