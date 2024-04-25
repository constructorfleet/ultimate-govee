import { DevicePropertiesDecoder } from './device.decoder';
import { BleAdvertisement } from '../../ble.types';
import { unpackLittle_hHB } from './packed-structures';

type UnpackedStruct = {
  temp: number;
  hum: number;
  batt: number;
};

const properties = ['tempC', 'hum', 'batt'] as const;

const unpackPacket = (manufacturerData: Buffer): UnpackedStruct => {
  const packet = Buffer.from(manufacturerData).toString('hex').slice(12, 23);
  const [temp, hum, batt] = unpackLittle_hHB(Buffer.from(packet));
  return {
    temp: (temp as number) / 100,
    hum: (hum as number) / 100,
    batt: batt as number,
  };
};

export const decodeH5179: DevicePropertiesDecoder<typeof properties> = {
  tempC: (advertisement: BleAdvertisement): number | undefined => {
    return unpackPacket(advertisement.manufacturerData).temp;
  },
  hum: (advertisement: BleAdvertisement): number | undefined => {
    return unpackPacket(advertisement.manufacturerData).hum;
  },
  batt: (advertisement: BleAdvertisement): number | undefined => {
    return unpackPacket(advertisement.manufacturerData).batt;
  },
};
