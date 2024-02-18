import { DeviceConfigReceivedEvent } from '../events/device-config-received.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DevicesService } from '../../devices.service';

@EventsHandler(DeviceConfigReceivedEvent)
export class DeviceConfigReceivedEventHandler
  implements IEventHandler<DeviceConfigReceivedEvent>
{
  constructor(private readonly service: DevicesService) {}

  async handle(event: DeviceConfigReceivedEvent) {
    const device = await this.service.discoverDevice(event.deviceConfig);
    device.deviceStatus(event.deviceConfig);
  }
}
