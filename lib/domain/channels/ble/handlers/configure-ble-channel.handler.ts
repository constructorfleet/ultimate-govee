import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigureBleChannelCommand } from '../commands/configure-ble-channel.command';
import { BleClient } from '~ultimate-govee-data';

@CommandHandler(ConfigureBleChannelCommand)
export class ConfigureBleChannelCommandHandler
  implements ICommandHandler<ConfigureBleChannelCommand, void>
{
  constructor(private readonly client: BleClient) {}

  async execute(command: ConfigureBleChannelCommand): Promise<void> {
    this.client.filterPeripherals = () => true;
    await this.client.enabled.next(command.enabled);
  }
}
