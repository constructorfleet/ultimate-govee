import { GoveeDeviceStatus } from '~ultimate-govee-data/govee-device';
import { BleAdvertisement } from '../../ble.types';
export type DevicePropertyDecoder = (
  advertisement: BleAdvertisement,
) => number | undefined;

export type DeviceData = {
  brand: string;
  model: string;
  modelName: string;
  type: string[];
};

export type DeviceDecodedProperties = GoveeDeviceStatus['state'] & DeviceData;

export type ModelDecoder = (
  advertisement: BleAdvertisement,
) => DeviceDecodedProperties;
