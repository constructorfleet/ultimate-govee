import { registerAs } from '@nestjs/config';

export const BleConfig = registerAs('Configuration.Ble.Client', () => ({
  primary: {
    serviceUUID: '000102030405060708090a0b0c0d1910',
    dataCharUUID: '000102030405060708090a0b0c0d2b10',
    controlCharUUID: '000102030405060708090a0b0c0d2b11',
  },
  secondary: {
    serviceUUID: '494e54454c4c495f524f434b535f4857',
    dataCharUUID: '494e54454c4c495f524f434b535f2012',
    controlCharUUID: '494e54454c4c495f524f434b535f2011',
  },
}));
