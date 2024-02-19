import { DeviceConfigReceivedEvent } from '../../../devices/cqrs';
import { EnableBleClientCommand } from '../commands/enable-ble-client.command';
import {
  CommandHandler,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import { DeviceId } from '~ultimate-govee-common';
import { BleClient, BlePeripheral } from '~ultimate-govee-data';

@EventsHandler(DeviceConfigReceivedEvent)
@CommandHandler(EnableBleClientCommand)
export class EnableBleClientCommandHandler
  implements
    ICommandHandler<EnableBleClientCommand>,
    IEventHandler<DeviceConfigReceivedEvent>
{
  private readonly idToAddress: Record<DeviceId, string> = {};

  constructor(private readonly bleClient: BleClient) {}

  handle(event: DeviceConfigReceivedEvent) {
    if (event.deviceConfig?.blueTooth?.mac !== undefined) {
      this.idToAddress[event.deviceConfig.id] =
        event.deviceConfig?.blueTooth?.mac;
    }
  }

  async execute(command: EnableBleClientCommand): Promise<any> {
    if (command.deviceIds !== undefined) {
      this.bleClient.filterPeripherals = (p: BlePeripheral) =>
        !command.deviceIds
          .map((id) => this.idToAddress[id])
          .filter((id) => id !== undefined)
          .includes(p.address);
    } else {
      this.bleClient.filterPeripherals = () => true;
    }
    return await this.bleClient.enabled.next(true);
  }
}
