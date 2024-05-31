import { Expose, Type } from 'class-transformer';
import {
  DeviceData,
  DeviceExternalResources,
  DeviceSettings,
} from '../../../device/models/device-list.response';

class DeviceExtension {
  @Expose({ name: 'deviceSettings' })
  @Type(() => DeviceSettings)
  deviceSettings!: DeviceSettings;

  @Expose({ name: 'lastDeviceData' })
  @Type(() => DeviceData)
  lastDeviceData!: DeviceData;

  @Expose({ name: 'extResources' })
  @Type(() => DeviceExternalResources)
  externalResources!: DeviceExternalResources;
}

export class EnvironmentResponse {
  @Expose({ name: 'groupId' })
  groupId!: number;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'spec' })
  spec?: unknown;

  @Expose({ name: 'versionHard' })
  hardwareVersion!: string;

  @Expose({ name: 'versionSoft' })
  softwareVersion!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'goodsType' })
  goodsType!: number;

  @Expose({ name: 'deviceExt' })
  @Type(() => DeviceExtension)
  deviceExtension!: DeviceExtension;
}
