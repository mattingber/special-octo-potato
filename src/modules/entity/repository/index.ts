import { EntityRepository } from '../infra/mongoose/EntityRepository';
import connection from '../../../shared/infra/mongoose/connection';
import { eventOutbox } from '../../../shared/infra/mongoose/eventOutbox';

export const entityRepository = new EntityRepository(connection, eventOutbox);
