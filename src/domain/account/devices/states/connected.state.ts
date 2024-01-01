import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const ConnectedStateName: 'isConnected' = 'isConnected' as const;
export type ConnectedStateName = typeof ConnectedStateName;

type IsConnectedType = {
  state?: {
    isConnected?: boolean;
    isOnline?: boolean;
  };
};

export class ConnectedState extends DeviceState<
  ConnectedStateName,
  boolean | undefined
> {
  constructor(device: DeviceModel) {
    super(device, ConnectedStateName, undefined);
  }

  parseState(data: IsConnectedType) {
    if (data?.state?.isConnected !== undefined) {
      this.stateValue.next(data?.state?.isConnected);
    } else if (data?.state?.isOnline !== undefined) {
      this.stateValue.next(data?.state?.isOnline);
    }
  }
}
