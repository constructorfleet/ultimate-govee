import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MqttService } from '~ultimate-govee-common';
import { OpenAPISubscribeCommand } from '../commands';
import { OpenAPIMqttPacket } from '~ultimate-govee-data';

@CommandHandler(OpenAPISubscribeCommand)
export class OpenAPISubscribeCommandHandler
  implements ICommandHandler<OpenAPISubscribeCommand, void>
{
  constructor(private readonly mqtt: MqttService<OpenAPIMqttPacket>) {}

  async execute(command: OpenAPISubscribeCommand): Promise<void> {
    await this.mqtt.subscribe(command.topic);
  }
}
