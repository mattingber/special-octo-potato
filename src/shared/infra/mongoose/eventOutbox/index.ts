import connection from '../connection';
import { EventOutbox } from './Outbox';

export const eventOutbox = new EventOutbox(connection);
 