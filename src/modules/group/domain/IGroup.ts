import { GroupId } from "./GroupId";

export interface IGroup {
  name: string;
  source: string; // todo: value object. 
  akaUnit?: string;
  hierarchy: string;
  ancestors: GroupId[];
  status?: string;
  isLeaf: boolean;
}