import { UniqueEntityId } from "../../../core/domain/UniqueEntityId";
import { Result, err, ok } from "neverthrow";

// TODO: remove this, need to get from config
const domains = ['shirutim', 'mm'];
const re = new RegExp(`.+@${domains.join('|')}`, 'gi'); //TODO: maybe replace special characters in domains

export class DigitalIdentityId extends UniqueEntityId {
  private constructor(id: string) {
    super(id);
  }

  private static isValid(id: string) {
    return re.test(id);
  }

  private static format(id: string) {
    return id.toLowerCase();
  }

  public static create(id: string): Result<DigitalIdentityId, string> {
    if(!DigitalIdentityId.isValid(id)) {
      return err(`invalid digital identity unique id: ${id}`);
    }
    return ok(new DigitalIdentityId(DigitalIdentityId.format(id)));
  }
}
