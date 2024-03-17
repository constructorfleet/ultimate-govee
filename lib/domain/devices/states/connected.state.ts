import { Optional, isTypeOf } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const ConnectedStateName: 'isConnected' = 'isConnected' as const;
export type ConnectedStateName = typeof ConnectedStateName;

type IsConnectedType = {
  state?: {
    isConnected?: boolean;
    connected?: boolean;
    online?: boolean;
    isOnline?: boolean;
  };
};

export class ConnectedState extends DeviceState<
  ConnectedStateName,
  Optional<boolean>
> {
  constructor(device: DeviceModel) {
    super(device, ConnectedStateName, undefined);
  }

  parseState(data: IsConnectedType) {
    if (isTypeOf(data?.state?.isConnected, 'boolean')) {
      this.stateValue.next(data.state.isConnected);
    } else if (isTypeOf(data?.state?.isOnline, 'boolean')) {
      this.stateValue.next(data?.state.isOnline);
    } else if (isTypeOf(data?.state?.connected, 'boolean')) {
      this.stateValue.next(data?.state.connected);
    } else if (isTypeOf(data?.state?.online, 'boolean')) {
      this.stateValue.next(data?.state.online);
    }
  }
}
