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
import { UpdateDigitalIdentityDTO } from "./dtos/UpdateDigitalIdentityDTO";

export class DigitalIdentityService {
  constructor(
    private diRepository: DigitalIdentityRepository
  ){}

  async createDigitalIdentity(createDTO: CreateDigitalIdentityDTO): Promise<Result<
    void,
    MailAlreadyExistsError |
    DigitalIdentityAlreadyExistsError |
    AppError.ValueValidationError |
    AppError.RetryableConflictError
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
        canConnectRole: createDTO.isRoleAttachable,
      },
      { isNew: true }
    );

    if(digitalIdentity.isErr()) {
      return err(digitalIdentity.error);
    }
    if(await this.diRepository.exists(uid.value)) {
      return err(DigitalIdentityAlreadyExistsError.create(createDTO.uniqueId));
    }
    return (await this.diRepository.save(digitalIdentity.value))
      .mapErr(err => AppError.RetryableConflictError.create(err.message));
  }

  async updateDigitalIdentity(updateDTO: UpdateDigitalIdentityDTO): Promise<Result<
    void,
    AppError.ValueValidationError | 
    AppError.ResourceNotFound |
    AppError.RetryableConflictError
  >> {
    const uid = DigitalIdentityId.create(updateDTO.uniqueId)
      .mapErr(AppError.ValueValidationError.create);
    if(uid.isErr()) { return err(uid.error); }
    const digitalIdentity = await this.diRepository.getByUniqueId(uid.value);
    if(!digitalIdentity) {
      return err(AppError.ResourceNotFound.create(updateDTO.uniqueId, 'digital identity'));
    }
    if(has(updateDTO, 'mail')) {
      const mail = Mail.create(updateDTO.mail)
        .mapErr(AppError.ValueValidationError.create);
      if(mail.isErr()) { return err(mail.error); }
      digitalIdentity.updateMail(mail.value);
    }
    if(has(updateDTO, 'isRoleAttachable')) {
      if(updateDTO.isRoleAttachable === false) {
        digitalIdentity.disableRoleConnectable();
      }
    }
    return (await this.diRepository.save(digitalIdentity))
      .mapErr(err => AppError.RetryableConflictError.create(err.message));
  }

  // TODO: implement delete and maybe move connect/disconnect entity service methods to this class
}