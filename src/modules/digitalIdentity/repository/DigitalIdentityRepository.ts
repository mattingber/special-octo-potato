import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentity } from "../domain/DigitalIdentity";
import { DigitalIdentityId } from "../domain/DigitalIdentityId";
import { EntityId } from "../../entity/domain/EntityId";
import { Mail } from "../domain/Mail";
import { Result } from "neverthrow";
import { AggregateVersionError } from "../../../core/infra/AggregateVersionError";

export interface DigitalIdentityRepository extends Repository<DigitalIdentity> {
  save(digitalIdentity: DigitalIdentity): Promise<Result<void, AggregateVersionError>>;
  getByUniqueId(uniqueId: DigitalIdentityId): Promise<DigitalIdentity | null>;
  getByEntityId(entityId: EntityId): Promise<DigitalIdentity[]>;
  exists(identifier: Mail | DigitalIdentityId): Promise<boolean>;
}