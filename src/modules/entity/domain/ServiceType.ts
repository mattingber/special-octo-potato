import { Result, err, ok } from "neverthrow";
import { BasicValueObject } from "../../../core/domain/BasicValueObject";

// TODO: replace this with value from config
const serviceTypes = ['keva','hova']

export class ServiceType extends BasicValueObject<string>{

  private static isValid(serviceType: string) {
    return serviceTypes.includes(serviceType);
  }

  public static create(serviceType: string): Result<ServiceType, string> {
    if(!ServiceType.isValid(serviceType)) {
      return err(`invalid service Type: ${serviceType}`);
    }
    return ok(new ServiceType(serviceType));
  }

}