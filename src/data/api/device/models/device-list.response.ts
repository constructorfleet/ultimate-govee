import { GoveeAPIResponse } from '../../govee-api.models';

export type DeviceSettings = {
  wifiName?: string;
  wifiMac?: string;
  bleName?: string;
  topic?: string;
  address?: string;
  pactType: number;
  pactCode: number;
  boilWaterCompletedNotiOnOff?: number;
  completionNotiOnOff?: number;
  autoShutDownOnOff?: number;
  filterExpireOnOff?: number;
  playState?: boolean;
  wifiSoftVersion?: string;
  wifiHardVersion?: string;
  versionHard: string;
  versionSoft: string;
  ic: number;
  secretCode?: string;
  device: string;
  deviceName: string;
  sku: string;
  waterShortage?: number;
};

export type DeviceData = {
  online: boolean;
  isOnOff?: number;
};

export type DeviceExternalResources = {
  skuImageUrl?: string;
  onImageUrl?: string;
  offImageUrl?: string;
  ext?: string;
  ic?: number;
};

export type DeviceExtensionProperties = {
  deviceSettings: string;
  lastDeviceData: string;
  extResources: string;
};

export type Device = {
  groupId: number;
  device: string;
  sku: string;
  spec: string;
  verionHard: string;
  versionSoft: string;
  deviceName: string;
  pactType: number;
  pactCode: number;
  goodsType: number;
  deviceEx: DeviceExtensionProperties;
};

export type DeviceListResponse = {
  devices: unknown[];
} & GoveeAPIResponse;
