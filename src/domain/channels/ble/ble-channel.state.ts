import { DeviceId } from '@govee/common';
import { DecodedDevice } from '@govee/data';
import { ChannelState } from '../channel.state';

export type BleChannelConfig = {
  enabled: boolean;
};

type NewType = {
  peripherals: Record<DeviceId, DecodedDevice>;
  serviceUUID: '000102030405060708090a0b0c0d1910';
  dataCharacteristic: '000102030405060708090a0b0c0d2b10';
  controlCharacteristic: '000102030405060708090a0b0c0d2b11';
  keepAlive: 'aa010000000000000000000000000000000000ab';
};

export type BleChannelState = ChannelState<BleChannelConfig> & NewType;
