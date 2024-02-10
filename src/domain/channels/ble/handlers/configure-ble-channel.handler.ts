import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigureBleChannelCommand } from '../commands/configure-ble-channel.command';

@CommandHandler(ConfigureBleChannelCommand)
export class ConfigureBleChannelCommandHandler
  implements ICommandHandler<ConfigureBleChannelCommand>
{
  async execute(command: ConfigureBleChannelCommand): Promise<any> {
    return undefined;
  }
}
