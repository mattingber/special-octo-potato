import { GroupRepository } from "../infra/mongoose/GroupRepository";
import connection from "../../../shared/infra/mongoose/connection";
import { eventOutbox } from "../../../shared/infra/mongoose/eventOutbox";

export const groupRepository = new GroupRepository(connection, eventOutbox);
