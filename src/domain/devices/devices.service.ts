import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeltaMap, DeviceId, Optional } from '@govee/common';
import { map, takeUntil } from 'rxjs';
import { Device } from './device';
import { DeviceDiscoveredEvent, DeviceUpdatedEvent } from './cqrs/events';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);

  private readonly deviceMap: DeltaMap<DeviceId, Device> = new DeltaMap({
    isModified: (current: Device, previous: Device) =>
      current.name !== previous.name,
  });

  constructor(private readonly eventBus: EventBus) {
    this.deviceMap.delta$
      .pipe(
        map((delta) => [
          ...Array.from(delta.added.values()).map(
            (device) => new DeviceDiscoveredEvent(device),
          ),
          ...Array.from(delta.modified.values()).map(
            (device) => new DeviceUpdatedEvent(device),
          ),
        ]),
      )
      .subscribe((events) => this.eventBus.publishAll(events));
  }

  getByModel(model: string) {
    return Array.from(this.deviceMap.values()).filter(
      (device) => device.model === model,
    );
  }

  getDevice(deviceId: DeviceId) {
    return this.deviceMap.get(deviceId);
  }

  getDeviceIds(): string[] {
    return Array.from(this.deviceMap.keys());
  }

  setDevice(device: Optional<Device>) {
    if (!device) {
      return;
    }
    if (this.getDevice(device.id)) {
      return;
    }
    this.deviceMap.set(device.id, device);
    return device;
  }
}
