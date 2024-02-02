import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  GoveeDevice,
  GoveeDeviceService,
  GoveeDeviceStatus,
  GoveeDiyService,
  GoveeEffectService,
  GoveeProductService,
  OAuthData,
} from '@govee/data';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel, createDeviceModel } from './devices.model';
import { DevicesFactory } from './devices.factory';
import { Device } from './types/device';
import { NewDeviceEvent } from './cqrs/events/new-device.event';
import { UpdateDeviceStatusCommand } from '../../../cqrs/commands/update-device-status.command';

@Injectable()
export class DevicesService {
  private readonly logger: Logger = new Logger(DevicesService.name);
  private devices: Record<string, Device> = {};
  public readonly onDeviceAdded: Subject<Device> = new Subject();

  constructor(
    private readonly deviceApi: GoveeDeviceService,
    private readonly productApi: GoveeProductService,
    private readonly devicesFactory: DevicesFactory,
    private readonly effectsApi: GoveeEffectService,
    private readonly diyApi: GoveeDiyService,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async refreshDeviceList(
    oauth: OAuthData,
    iotUpdater: (deviceModel: DeviceModel) => unknown,
  ) {
    this.logger.debug('Loading product categories');
    const productCategories = await this.productApi.getProductCategories();
    this.logger.debug('Loading devices');
    const deviceList = await this.deviceApi.getDeviceList(oauth);
    deviceList.forEach(async (apiDevice: GoveeDevice) => {
      if (this.devices[apiDevice.id] === undefined) {
        const device = this.devicesFactory.create(
          createDeviceModel(apiDevice, productCategories, iotUpdater),
        );
        if (device === undefined) {
          return;
        }
        this.eventBus.publish(new NewDeviceEvent(device));
      }
      await this.commandBus.execute(
        new UpdateDeviceStatusCommand(apiDevice.id, {
          cmd: 'status',
          ...apiDevice,
        }),
      );

      this.devices[apiDevice.id].deviceStatus(apiDevice);
    });
  }

  async onDeviceStatus(message: GoveeDeviceStatus) {
    await this.commandBus.execute(message);
  }
}
