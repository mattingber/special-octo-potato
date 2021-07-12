import { Schema, Model, SchemaOptions, model, ClientSession } from "mongoose"
import { IDomainEvent } from "../../../../core/domain/event/IDomainEvent";

export type OutboxMessage = {
  type: string;
  created: Date;
  occuredOn: Date;
  aggregateId: string;
}

const options: SchemaOptions = {
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  }
};

const outboxMessageSchema = new Schema<OutboxMessage, Model<OutboxMessage>, OutboxMessage>({
  type: {
    type: String,
    required: true,
  },
  aggregateId: String,
}, options);

const outboxModel = model('eventMessage', outboxMessageSchema);

export class Outbox {
  constructor(
    private _model: Model<OutboxMessage> = outboxModel
  ){}

  async put<T extends IDomainEvent>(event: T | T[], session: ClientSession) {
    if(Array.isArray(event)) {
      await this._model.insertMany(event.map(this.eventToMessage), { session });
    } else {
      await this._model.create([this.eventToMessage(event)], { session });
    }
  }

  private eventToMessage(event: IDomainEvent) {
    return {
      type: event.constructor.name,
      occuredOn: event.occuredOn,
      aggregateId: event.aggregateId.toString(),
      ...event.toPlainObject(),
    }
  }
}