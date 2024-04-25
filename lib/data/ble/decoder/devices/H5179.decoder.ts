import { BleAdvertisement } from '../../ble.types';
import { DeviceDecodedProperties, ModelDecoder } from './device.decoder';
import { unpackLittle_hHB } from './packed-structures';

type UnpackedStruct = {
  temp: number;
  hum: number;
  batt: number;
};

export const H5179 = {
  brand: 'Govee',
  model: 'H5179',
  modelName: 'Thermo-Hygrometer',
  type: ['Temperature', 'Humidity', 'Battery'],
};

const unpackPacket = (manufacturerData: Buffer): UnpackedStruct => {
  const packet = Buffer.from(manufacturerData).toString('hex').slice(12, 23);
  const [temp, hum, batt] = unpackLittle_hHB(Buffer.from(packet));
  return {
    temp: (temp as number) / 100,
    hum: (hum as number) / 100,
    batt: batt as number,
  };
};

export const decodeH5179: ModelDecoder = (
  advertisement: BleAdvertisement,
): DeviceDecodedProperties => {
  const { temp, hum, batt } = unpackPacket(advertisement.manufacturerData);
  return {
    temperature: {
      current: temp,
    },
    humidity: {
      current: hum,
    },
    battery: batt,
    ...H5179,
  };
};
