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
} from '../../../data';
import { DeviceModel, createDeviceModel } from './devices.model';
import { DevicesFactory } from './devices.factory';
import { Device } from './types/device';
import { RGBICLightDevice } from './types/lights';

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
  ) {}

  async loadDevices(
    oauth: OAuthData,
    iotUpdater: (deviceModel: DeviceModel) => unknown,
  ) {
    this.logger.log('Loading product categories');
    const productCategories = await this.productApi.getProductCategories();
    this.logger.log('Loading devices');
    const deviceList = await this.deviceApi.getDeviceList(oauth);
    deviceList.forEach(async (apiDevice: GoveeDevice) => {
      if (this.devices[apiDevice.id] === undefined) {
        const device = this.devicesFactory.create(
          createDeviceModel(apiDevice, productCategories, iotUpdater),
        );
        if (device === undefined) {
          return;
        }
        if (device instanceof RGBICLightDevice) {
          await this.effectsApi.getDeviceEffects(
            oauth,
            device.model,
            device.goodsType,
            device.id,
          );
          await this.diyApi.getDeviceDiys(
            oauth,
            device.model,
            device.goodsType,
            device.id,
          );
        }
        this.devices[device.id] = device;
        device.refresh();
      }
      this.devices[apiDevice.id].deviceStatus(apiDevice);
    });
  }

  onMessage(message: GoveeDeviceStatus) {
    if (this.devices === undefined) {
      this.logger.warn('No devices loaded', this.devices);
      return;
    }
    const device = this.devices[message.id];
    if (!device) {
      this.logger.warn(`Unknown device ${message.id}`);
      return;
    }
    device.deviceStatus(message);
    if (message.cmd !== 'status') {
      device.refresh();
    }
  }
}
