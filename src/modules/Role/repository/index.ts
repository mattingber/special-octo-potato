import { RoleRepository } from "../infra/mongoose/RoleRepository";
import connection from "../../../shared/infra/mongoose/connection";
import { eventOutbox } from "../../../shared/infra/mongoose/eventOutbox";

export const roleRepository = new RoleRepository(connection, eventOutbox);
