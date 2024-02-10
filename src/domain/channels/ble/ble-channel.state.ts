import { DeviceId } from '@govee/common';
import { BlePeripheral } from '@govee/data';
import { ChannelState } from '../channel.state';

export type BleChannelConfig = {
  enabled: boolean;
  serviceUUID: '00010203-0405-0607-0809-0a0b0c0d1910';
  controlCharacteristic: '000102030405060708090a0b0c0d2b11';
  keepAlive: 'aa010000000000000000000000000000000000ab';
};

type NewType = {
  devices: Record<DeviceId, BlePeripheral>;
};

export type BleChannelState = ChannelState<BleChannelConfig> & NewType;
