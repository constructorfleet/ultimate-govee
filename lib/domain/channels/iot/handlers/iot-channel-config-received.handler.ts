import { IoTChannelConfigReceivedEvent } from '../events/iot-channel-config-received.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IoTChannelService } from '../iot-channel.service';

@EventsHandler(IoTChannelConfigReceivedEvent)
export class IoTChannelConfigReceivedEventHandler
  implements IEventHandler<IoTChannelConfigReceivedEvent>
{
  constructor(private readonly service: IoTChannelService) {}

  handle(event: IoTChannelConfigReceivedEvent) {
    this.service.setConfig(event.config);
  }
}
