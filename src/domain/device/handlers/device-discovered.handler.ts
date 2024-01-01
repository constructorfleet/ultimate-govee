import { EventPublisher, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeviceDiscoveredEvent } from '../../cqrs';
import { DeviceStore } from '../device.store';
import { DeviceModel } from '../../models';

@EventsHandler(DeviceDiscoveredEvent)
export class DeviceDiscoveredHandler
  implements IEventHandler<DeviceDiscoveredEvent>
{
  constructor(
    private readonly store: DeviceStore,
    private readonly publisher: EventPublisher,
  ) {}

  handle(event: DeviceDiscoveredEvent) {
    const device = this.publisher.mergeObjectContext(
      this.store.get(event.id) ||
        new DeviceModel(
          event.id,
          event.name,
          event.model,
          event.ic,
          event.pactType,
          event.pactCode,
          event.goodsType,
          event.softwareVersion,
          event.hardwareVersion,
          event.iotTopic,
        ),
    );
    this.store.set(device);
    device.commit();
  }
}
