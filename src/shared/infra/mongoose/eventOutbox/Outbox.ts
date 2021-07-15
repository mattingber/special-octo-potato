import { Schema, Model, SchemaOptions, model, ClientSession } from "mongoose"
import { IDomainEvent } from "../../../../core/domain/event/IDomainEvent";

export type OutboxMessage = {
  type: string;
  created: Date;
  occuredOn: Date;
  aggregateId: string;
  payload: any;
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
  payload: {},
}, options);

const outboxModel = model('eventMessage', outboxMessageSchema);

export class Outbox {
  constructor(
    private _model: Model<OutboxMessage> = outboxModel
  ){}

  async put<T extends IDomainEvent>(events: T | T[], session: ClientSession) {
    if(Array.isArray(events)) {
      await this._model.insertMany(events.map(this.eventToMessage), { session });
    } else {
      await this._model.create([this.eventToMessage(events)], { session });
    }
  }

  private eventToMessage(event: IDomainEvent) {
    return {
      type: event.eventName,
      occuredOn: event.occuredOn,
      aggregateId: event.aggregateId.toString(),
      payload: event.toPlainObject(),
    };
  }
}