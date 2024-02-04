import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDeviceStatusCommand } from '../commands';
import { DevicesService } from '../../devices.service';

@CommandHandler(UpdateDeviceStatusCommand)
export class UpdateDeviceStatusCommandHandler
  implements ICommandHandler<UpdateDeviceStatusCommand>
{
  constructor(private readonly deviceService: DevicesService) {}
  async execute(command: UpdateDeviceStatusCommand): Promise<any> {
    const device = this.deviceService.getDevice(command.deviceId);
    if (!device) {
      return;
    }
    device.deviceStatus(command.status);
  }
}
