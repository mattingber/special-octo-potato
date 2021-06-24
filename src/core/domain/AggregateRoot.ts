import { EntityBase } from "./EntityBase";
import { EntityId } from "../../modules/entity/domain/EntityId";

export abstract class AggregateRoot extends EntityBase {
  // todo: add events and optimistic concurrency control
}

export type CreateOpts = {
  isNew: boolean;
}