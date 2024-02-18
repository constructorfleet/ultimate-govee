import {
  Expose,
  Transform,
  Type,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import stringify from 'json-stringify-safe';
import { GoveeAPIResponse } from '../../govee-api.models';
import { TransformBoolean } from '@constructorfleet/ultimate-govee/common';

export class DeviceSettings {
  @Expose({ name: 'wifiName' })
  wifiName?: string;

  @Expose({ name: 'wifiMac' })
  wifiMacAddress?: string;

  @Expose({ name: 'bleName' })
  bleName?: string;

  @Expose({ name: 'topic' })
  topic?: string;

  @Expose({ name: 'address' })
  bleAddress?: string;

  @Expose({ name: 'pactType' })
  pactType!: number;

  @Expose({ name: 'pactCode' })
  pactCode!: number;

  @Expose({ name: 'boilWaterCompletedNotiOnOff' })
  @TransformBoolean
  @Transform(
    ({ value }) => (value === undefined ? undefined : `${value ? '1' : '0'}`),
    {
      toPlainOnly: true,
    },
  )
  notifyWaterBoiling?: boolean;

  @Expose({ name: 'completionNotiOnOff' })
  @TransformBoolean
  @Transform(
    ({ value }) => (value === undefined ? undefined : `${value ? '1' : '0'}`),
    {
      toPlainOnly: true,
    },
  )
  notifyComplete?: boolean;

  @Expose({ name: 'autoShutDownOnOff' })
  @TransformBoolean
  @Transform(
    ({ value }) => (value === undefined ? undefined : `${value ? '1' : '0'}`),
    {
      toPlainOnly: true,
    },
  )
  automaticShutDown?: boolean;

  @Expose({ name: 'filterExpireOnOff' })
  @TransformBoolean
  @Transform(
    ({ value }) => (value === undefined ? undefined : `${value ? '1' : '0'}`),
    {
      toPlainOnly: true,
    },
  )
  filterExpired?: boolean;

  @Expose({ name: 'playState' })
  @TransformBoolean
  playState?: boolean;

  @Expose({ name: 'wifiSoftVersion' })
  wifiSoftVersion?: string;

  @Expose({ name: 'wifiHardVersion' })
  wifiHardwareVersion?: string;

  @Expose({ name: 'versionHard' })
  hardwareVersion!: string;

  @Expose({ name: 'versionSoft' })
  softwareVersion!: string;

  @Expose({ name: 'ic' })
  ic!: number;

  @Expose({ name: 'secretCode' })
  secretCode?: string;

  @Expose({ name: 'device' })
  deviceId!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'waterShortageOnOff' })
  @TransformBoolean
  @Transform(
    ({ value }) => (value === undefined ? undefined : `${value ? '1' : '0'}`),
    {
      toPlainOnly: true,
    },
  )
  waterShortage?: boolean;

  @Expose({ name: 'battery' })
  batteryLevel?: number;

  @Expose({ name: 'humMax' })
  maxHumidity?: number;

  @Expose({ name: 'humMin' })
  minHumidity?: number;

  @Expose({ name: 'humCali' })
  Calibration?: number;

  @Expose({ name: 'humWarning' })
  humidityWarning?: boolean;

  @Expose({ name: 'temMax' })
  maxTemperature?: number;

  @Expose({ name: 'temMin' })
  minTemperature?: number;

  @Expose({ name: 'temCali' })
  temperatureCalibration?: number;

  @Expose({ name: 'temWarning' })
  temperatureWarning?: boolean;

  @Expose({ name: 'uploadRate' })
  uploadRate?: number;

  @Expose({ name: 'bdType' })
  bdType?: number;

  @Expose({ name: 'mcuSoftVersion' })
  mcuSoftwareVersion?: string;

  @Expose({ name: 'mcuHardVersion' })
  mcuHardwareVersion?: string;

  @Expose({ name: 'time' })
  time?: number;
}

export class DeviceData {
  @Expose({ name: 'online' })
  @TransformBoolean
  isOnline!: boolean;

  @Expose({ name: 'isOnOff' })
  isOn?: number;

  @Expose({ name: 'bind' })
  @TransformBoolean
  bind?: boolean;

  @Expose({ name: 'tem' })
  currentTemperature?: number;

  @Expose({ name: 'hum' })
  currentHumditity?: number;

  @Expose({ name: 'lastTime' })
  lastReportTimestamp?: number;
}

export class DeviceExternalResources {
  @Expose({ name: 'skuImageUrl' })
  imageUrl?: string;

  @Expose({ name: 'onImageUrl' })
  onImageUrl?: string;

  @Expose({ name: 'offImageUrl' })
  offImageUrl?: string;

  @Expose({ name: 'ext' })
  ext?: string;

  @Expose({ name: 'ic' })
  ic?: number;
}

export class DeviceExtensionProperties {
  @Expose({ name: 'deviceSettings' })
  @Transform(
    ({ value }) => plainToInstance(DeviceSettings, JSON.parse(value)),
    { toClassOnly: true },
  )
  @Transform(({ value }) => stringify(instanceToPlain(value)), {
    toPlainOnly: true,
  })
  deviceSettings!: DeviceSettings;

  @Expose({ name: 'lastDeviceData' })
  @Transform(({ value }) => plainToInstance(DeviceData, JSON.parse(value)), {
    toClassOnly: true,
  })
  @Transform(({ value }) => stringify(instanceToPlain(value)), {
    toPlainOnly: true,
  })
  deviceData!: DeviceData;

  @Expose({ name: 'extResources' })
  @Transform(
    ({ value }) => plainToInstance(DeviceExternalResources, JSON.parse(value)),
    { toClassOnly: true },
  )
  @Transform(({ value }) => stringify(instanceToPlain(value)), {
    toPlainOnly: true,
  })
  externalResources!: DeviceExternalResources;

  @Expose({ name: 'subDevice' })
  subDevice?: string;
}

export class GoveeAPIDevice {
  @Expose({ name: 'groupId' })
  groupId?: number;

  @Expose({ name: 'device' })
  device!: string;

  @Expose({ name: 'sku' })
  sku!: string;

  @Expose({ name: 'spec' })
  spec?: string;

  @Expose({ name: 'versionHard' })
  verionHard!: string;

  @Expose({ name: 'versionSoft' })
  versionSoft!: string;

  @Expose({ name: 'deviceName' })
  deviceName!: string;

  @Expose({ name: 'pactType' })
  pactType!: number;

  @Expose({ name: 'pactCode' })
  pactCode!: number;

  @Expose({ name: 'goodsType' })
  goodsType!: number;

  @Expose({ name: 'deviceExt' })
  @Type(() => DeviceExtensionProperties)
  deviceExt!: DeviceExtensionProperties;
}

export class DeviceListResponse extends GoveeAPIResponse {
  @Expose({ name: 'devices' })
  @Type(() => GoveeAPIDevice)
  devices!: GoveeAPIDevice[];
}
