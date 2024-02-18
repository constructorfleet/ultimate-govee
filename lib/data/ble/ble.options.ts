import { registerAs } from '@nestjs/config';

export const BleConfig = registerAs('Configuration.Ble.Client', () => ({
  serviceUUID: '000102030405060708090a0b0c0d1910',
  dataCharUUID: '000102030405060708090a0b0c0d2b10',
  controlCharUUID: '000102030405060708090a0b0c0d2b11',
}));
