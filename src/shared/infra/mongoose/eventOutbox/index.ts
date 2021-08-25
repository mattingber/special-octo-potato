import connection from '../connection';
import { EventOutbox } from './Outbox';
import config from "config";

export const eventOutbox = new EventOutbox(connection,  { 
  modelName: config.get('db.mongo.modelNames.eventOutbox') 
});
 