import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DisableBleClientCommand } from '../commands/disable-ble-client.command';
import { BleClient } from '~ultimate-govee/data';

@CommandHandler(DisableBleClientCommand)
export class DisableBleClientCommandHandler
  implements ICommandHandler<DisableBleClientCommand>
{
  constructor(private readonly client: BleClient) {}

  async execute(): Promise<any> {
    this.client.filterPeripherals = () => false;
    await this.client.enabled.next(false);
  }
}
