import { Optional } from '@govee/common';
import { DeviceModel } from '../devices.model';
import { DeviceState } from './device.state';

export const PowerStateName: 'power' = 'power' as const;
export type PowerStateName = typeof PowerStateName;

export type PowerType = {
  isOn?: boolean;
  state?: {
    isOn?: boolean;
    onOff?: boolean;
  };
};

export class PowerState extends DeviceState<PowerStateName, Optional<boolean>> {
  constructor(device: DeviceModel) {
    super(device, PowerStateName, undefined);
  }

  parseState(data: PowerType) {
    if (data?.isOn !== undefined) {
      this.stateValue.next(data.isOn);
    } else if (data?.state?.onOff !== undefined) {
      this.stateValue.next(data.state.onOff);
    } else if (data?.state?.isOn !== undefined) {
      this.stateValue.next(data.state.isOn);
    }
  }

  setState(nextState: Optional<boolean>) {
    if (nextState === undefined) {
      this.logger.warn('Power was not specified, ignoring command');
      return;
    }
    this.commandBus.next({
      command: 'turn',
      data: {
        value: nextState ? 1 : 0,
      },
    });

    this.commandBus.next({
      command: 'turn',
      data: {
        val: nextState ? '1' : '0',
      },
    });
  }
}
