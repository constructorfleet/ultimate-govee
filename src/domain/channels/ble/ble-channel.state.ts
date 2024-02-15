import { DeviceId } from '@govee/common';
import { DecodedDevice } from '@govee/data';
import { ChannelState } from '../channel.state';

export type BleChannelConfig = {
  enabled: boolean;
};

type NewType = {
  peripherals: Record<DeviceId, DecodedDevice>;
};

export type BleChannelState = ChannelState<BleChannelConfig> & NewType;
