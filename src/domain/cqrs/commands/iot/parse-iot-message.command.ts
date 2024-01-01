import { Message } from '../../../models/messages/message';

export class ParseIoTMessageCommand {
  constructor(public readonly message: Message) {}
}
