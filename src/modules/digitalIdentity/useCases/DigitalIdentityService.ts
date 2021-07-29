import { DigitalIdentityRepository } from "../repository/DigitalIdentityRepository";
import { CreateDigitalIdentityDTO } from "./dtos/CreateDigitalIdentityDTO";
import { DigitalIdentityId } from "../domain/DigitalIdentityId";
import { AppError } from "../../../core/logic/AppError";
import { err, ok, Result } from "neverthrow";
import { Mail } from "../domain/Mail";
import { Source } from "../domain/Source";
import { castToDigitalIdentityType, DigitalIdentity } from "../domain/DigitalIdentity";
import { has } from "../../../utils/ObjectUtils";
import { MailAlreadyExistsError } from "./errors/MailAlreadyExistsError";
import { DigitalIdentityAlreadyExistsError } from "./errors/DigitalIdentityAlreadyExistsError";

export class DigitalIdentityService {
  constructor(
    private diRepository: DigitalIdentityRepository
  ){}

  async createDigitalIdentity(createDTO: CreateDigitalIdentityDTO): Promise<Result<
    void,
    MailAlreadyExistsError |
    DigitalIdentityAlreadyExistsError |
    AppError.ValueValidationError
  >> {
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

    const source = Source.create(createDTO.source)
    .mapErr(AppError.ValueValidationError.create);
    if(source.isErr()) {
      return err(source.error);
    }
    
    let mail;
    if(has(createDTO, 'mail')) {
      mail = Mail.create(createDTO.mail)
      .mapErr(AppError.ValueValidationError.create);
      if(mail.isErr()) {
        return err(mail.error);
      }
      if(await this.diRepository.exists(mail.value)) {
        return err(MailAlreadyExistsError.create(createDTO.mail));
      }
    }

    const digitalIdentity = DigitalIdentity.create(
      uid.value, 
      {
        mail: mail?.value,
        source: source.value,
        type: type.value,
        canConnectRole: createDTO.canConnectRole,
      },
      { isNew: true }
    );

    if(digitalIdentity.isErr()) {
      return err(digitalIdentity.error);
    }
    if(await this.diRepository.exists(uid.value)) {
      return err(DigitalIdentityAlreadyExistsError.create(createDTO.uniqueId));
    }
    await this.diRepository.save(digitalIdentity.value);
    return ok(undefined);
  }
}