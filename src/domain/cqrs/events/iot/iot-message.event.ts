import { Message } from '../../../models/messages/message';

export class IoTMessageEvent {
  constructor(public readonly message: Message) {}
}
