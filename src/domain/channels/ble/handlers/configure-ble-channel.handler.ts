import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigureBleChannelCommand } from '../commands/configure-ble-channel.command';

@CommandHandler(ConfigureBleChannelCommand)
export class ConfigureBleChannelCommandHandler
  implements ICommandHandler<ConfigureBleChannelCommand, void>
{
  async execute(command: ConfigureBleChannelCommand): Promise<void> {
    // TODO: Configure BLE Channel
  }
}
