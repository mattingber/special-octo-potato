import { groupRepository } from "../repository";
import { GroupService } from "./GroupService";

export const groupService = new GroupService(groupRepository);
