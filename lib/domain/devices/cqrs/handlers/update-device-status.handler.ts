import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDeviceStatusCommand } from '../commands/update-device-status.command';
import { DevicesService } from '../../devices.service';

@CommandHandler(UpdateDeviceStatusCommand)
export class UpdateDeviceStatusCommandHandler
  implements ICommandHandler<UpdateDeviceStatusCommand, void>
{
  constructor(private readonly deviceService: DevicesService) {}

  async execute(command: UpdateDeviceStatusCommand): Promise<void> {
    await this.deviceService
      .getDevice(command.deviceId)
      ?.deviceStatus(command.status);
  }
}
