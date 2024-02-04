import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeltaMap, DeviceId, Optional } from '@govee/common';
import { map } from 'rxjs';
import { Device } from './device';
import { DeviceDiscoveredEvent, DeviceUpdatedEvent } from './cqrs/events';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);
  private readonly deviceMap: DeltaMap<DeviceId, Device> = new DeltaMap({
    isModified: (current: Device, previous: Device) =>
      current.name !== previous.name,
  });

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {
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

  getDevice(deviceId: DeviceId) {
    return this.deviceMap.get(deviceId);
  }

  setDevice(device: Optional<Device>) {
    if (!device) {
      return;
    }
    this.deviceMap.set(device.id, device);
  }

  // async refreshDeviceList(
  //   oauth: OAuthData,
  //   iotUpdater: (deviceModel: DeviceModel) => unknown,
  // ) {
  //   this.logger.debug('Loading product categories');
  //   const productCategories = await this.productApi.getProductCategories();
  //   this.logger.debug('Loading devices');
  //   const deviceList = await this.deviceApi.getDeviceList(oauth);
  //   deviceList.forEach(async (apiDevice: GoveeDevice) => {
  //     if (this.devices[apiDevice.id] === undefined) {
  //       const device = this.devicesFactory.create(
  //         createDeviceModel(apiDevice, productCategories, iotUpdater),
  //       );
  //       if (device === undefined) {
  //         return;
  //       }
  //       this.eventBus.publish(new NewDeviceEvent(device));
  //     }
  //     await this.commandBus.execute(
  //       new UpdateDeviceStatusCommand(apiDevice.id, {
  //         cmd: 'status',
  //         ...apiDevice,
  //       }),
  //     );

  //     this.devices[apiDevice.id].deviceStatus(apiDevice);
  //   });
  // }

  // async onDeviceStatus(message: GoveeDeviceStatus) {
  //   await this.commandBus.execute(message);
  // }
}
