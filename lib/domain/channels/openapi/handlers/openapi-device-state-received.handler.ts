import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OpenAPIDeviceStateReceivedEvent } from '../events/openapi-device-state-received.event';
import { Logger } from '@nestjs/common';

@EventsHandler(OpenAPIDeviceStateReceivedEvent)
export class OpenAPIDeviceStateReceivedEventHandler
  implements IEventHandler<OpenAPIDeviceStateReceivedEvent>
{
  private readonly logger: Logger = new Logger(
    OpenAPIDeviceStateReceivedEventHandler.name,
  );
  constructor(private readonly eventBus: EventBus) {}

  handle({ deviceState }: OpenAPIDeviceStateReceivedEvent) {
    this.logger.debug(`Ignoring state for ${deviceState.deviceId}`);
    return;
    // const deviceStatus: GoveeDeviceStatus = {
    //   id: deviceState.deviceId,
    //   model: deviceState.model,
    //   state: {
    //     online: de
    //   }
    // };
    // await this.eventBus.publish(new DeviceStatusReceivedEvent(deviceStatus));
  }
}
