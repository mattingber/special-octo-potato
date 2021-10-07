import { Result, err, ok } from "neverthrow";
import { BasicValueObject } from "../../../core/domain/BasicValueObject";
import config from "config";

export type digitalIdentityType = {
  DomainUser: string,
  VirtualUser: string,
}

export const DigitalIdentityTypes: digitalIdentityType = config.get('valueObjects.digitalIdentityType');


// export class DigitalIdentityType extends BasicValueObject<string>{

//   private static isValid(diType: string) {
//     return Object.values(DigitalIdentityTypes).includes(diType);
//     // return true TODO: fix unsafeWrap error specific at source
//   }

//   public static create(diType: string): Result<DigitalIdentityType, string> {
//     if(!DigitalIdentityType.isValid(diType)) {
//       return err(`invalid digitalIdentity type: ${diType}`);
//     }
//     return ok(new DigitalIdentityType(diType));
//   }
// }

