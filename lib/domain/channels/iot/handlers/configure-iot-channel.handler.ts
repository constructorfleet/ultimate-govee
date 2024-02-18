import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigureIoTChannelCommand } from '../commands';
import { IoTChannelService } from '../iot-channel.service';

@CommandHandler(ConfigureIoTChannelCommand)
export class ConfigureIoTChannelCommandHandler
  implements ICommandHandler<ConfigureIoTChannelCommand, void>
{
  constructor(private readonly channel: IoTChannelService) {}

  async execute(command: ConfigureIoTChannelCommand): Promise<void> {
    await this.channel.setConfig(command.config);
  }
}
