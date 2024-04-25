import { DevicePropertiesDecoder } from './device.decoder';
import { BleAdvertisement } from '../../ble.types';

const properties = ['tempC', 'hum', 'pm25'] as const;

export const decodeH5106: DevicePropertiesDecoder<typeof properties> = {
  tempC: (advertisement: BleAdvertisement): number | undefined => {
    const packet = parseInt(
      `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(8, 16)}`,
      16,
    );
    if (packet & 0x80000000) {
      const packetValue = packet & 0x7fffffff;
      return Math.floor(packetValue / -10000000) / -10;
    }
    return Math.floor(packet / 1000000) / 10;
  },
  hum: (advertisement: BleAdvertisement): number | undefined => {
    const packet = parseInt(
      `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(8, 16)}`,
      16,
    );
    return Math.floor(((packet & 0x7fffffff) % 1000000) / 1000) / 10;
  },
  pm25: (advertisement: BleAdvertisement): number | undefined => {
    const packet = parseInt(
      `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(8, 16)}`,
      16,
    );
    return (packet & 0x7fffffff) % 1000;
  },
};
