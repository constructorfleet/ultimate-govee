import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BleRecordDeviceCommand } from '../commands/ble-record-device.command';
import { BleChannelService } from '../ble-channel.service';

@CommandHandler(BleRecordDeviceCommand)
export class BleRecordDeviceCommandHandler
  implements ICommandHandler<BleRecordDeviceCommand>
{
  constructor(private readonly service: BleChannelService) {}

  async execute(command: BleRecordDeviceCommand): Promise<any> {
    this.service.recordDevice(command.device);
  }
}
