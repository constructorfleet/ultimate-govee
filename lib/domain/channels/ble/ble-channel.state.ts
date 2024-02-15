import { DeviceId } from '@constructorfleet/ultimate-govee/common';
import { DecodedDevice } from '@constructorfleet/ultimate-govee/data';
import { ChannelState } from '../channel.state';

export type BleChannelConfig = {
  enabled: boolean;
};

type NewType = {
  peripherals: Record<DeviceId, DecodedDevice>;
};

export type BleChannelState = ChannelState<BleChannelConfig> & NewType;
