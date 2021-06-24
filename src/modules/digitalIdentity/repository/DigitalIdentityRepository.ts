import { Repository } from "../../../core/infra/Repository";
import { DigitalIdentity } from "../domain/DigitalIdentity";
import { DigitalIdentityId } from "../domain/DigitalIdentityId";
import { EntityId } from "../../entity/domain/EntityId";

export interface DigitalIdentityRepository extends Repository<DigitalIdentity> {
  save(digitalIdentity: DigitalIdentity): Promise<void>;
  getByUniqueId(uniqueId: DigitalIdentityId): Promise<DigitalIdentity | null>;
  getByEntityId(entityId: EntityId): Promise<DigitalIdentity | null>;
}