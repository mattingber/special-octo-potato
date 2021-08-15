import { Result } from "neverthrow";
import { AggregateRoot } from "../domain/AggregateRoot";
import { AggregateVersionError } from "./AggregateVersionError";

export interface Repository<T extends AggregateRoot> {
  save(t: T): Promise<Result<any, AggregateVersionError>>
}
