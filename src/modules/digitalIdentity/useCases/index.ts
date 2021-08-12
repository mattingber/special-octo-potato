import { DigitalIdentityService } from "./DigitalIdentityService";
import { digitalIdentityRepository } from "../repository";

export const digitalIdentityService = new DigitalIdentityService(digitalIdentityRepository);
