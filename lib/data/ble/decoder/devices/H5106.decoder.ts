import { DeviceDecodedProperties, ModelDecoder } from './device.decoder';
import { BleAdvertisement } from '../../ble.types';

export const properties = ['temperature', 'hum', 'pm25'] as const;

export const H5106 = {
  brand: 'Govee',
  model: 'H5106',
  modelName: 'Smart Air Quality Monitor',
  type: ['Air Environmental Monitoring Devices'],
};

export const decodeH5106: ModelDecoder = (
  advertisement: BleAdvertisement,
): DeviceDecodedProperties => {
  const packet = parseInt(
    `0x${Buffer.from(advertisement.manufacturerData).toString('hex').slice(8, 16)}`,
    16,
  );
  const getTemp = (): number | undefined => {
    if (packet & 0x80000000) {
      const packetValue = packet & 0x7fffffff;
      return Math.floor(packetValue / -10000000) / -10;
    }
    return Math.floor(packet / 1000000) / 10;
  };
  const getHum = (): number | undefined => {
    return Math.floor(((packet & 0x7fffffff) % 1000000) / 1000) / 10;
  };
  const getPM25 = (): number | undefined => {
    return (packet & 0x7fffffff) % 1000;
  };
  return {
    temperature: {
      current: getTemp(),
    },
    humidity: {
      current: getHum(),
    },
    pm25: {
      current: getPM25(),
    },
    ...H5106,
  };
};
