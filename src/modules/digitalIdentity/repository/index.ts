import { DigitalIdentityRepository } from "../infra/mongoose/DigitalIdentityRepository";
import connection from "../../../shared/infra/mongoose/connection"
import { eventOutbox } from "../../../shared/infra/mongoose/eventOutbox";

export const digitalIdentityRepository = new DigitalIdentityRepository(connection, eventOutbox);
 