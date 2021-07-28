import { DigitalIdentityRepository } from "../repository/DigitalIdentityRepository";
import { CreateDigitalIdentityDTO } from "./dtos/CreateDigitalIdentityDTO";
import { DigitalIdentityId } from "../domain/DigitalIdentityId";
import { AppError } from "../../../core/logic/AppError";
import { err } from "neverthrow";
import { Mail } from "../domain/Mail";
import { Source } from "../domain/Source";
import { castToDigitalIdentityType, DigitalIdentity } from "../domain/DigitalIdentity";

export class DigitalIdentityService {
  constructor(
    private diRepository: DigitalIdentityRepository
  ){}

  async createDigitalIdentity(createDTO: CreateDigitalIdentityDTO) {
    const uid = DigitalIdentityId.create(createDTO.uniqueId)
      .mapErr(AppError.ValueValidationError.create);
    if(uid.isErr()) {
      return err(uid.error);
    }
    const type = castToDigitalIdentityType(createDTO.type)
      .mapErr(AppError.ValueValidationError.create);
    if(type.isErr()) {
      return err(type.error);
    }
    const mail = Mail.create(createDTO.mail)
      .mapErr(AppError.ValueValidationError.create);
    if(mail.isErr()) {
      return err(mail.error);
    }
    const source = Source.create(createDTO.source)
      .mapErr(AppError.ValueValidationError.create);
    if(source.isErr()) {
      return err(source.error);
    }
    let digitalIdentity: DigitalIdentity;
    // TODO: create...

  }
}