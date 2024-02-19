import { Optional } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceState, StateCommandAndStatus } from './device.state';

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
      this.stateValue$.next(data.isOn);
    } else if (data?.state?.onOff !== undefined) {
      this.stateValue$.next(data.state.onOff);
    } else if (data?.state?.isOn !== undefined) {
      this.stateValue$.next(data.state.isOn);
    }
  }

  protected stateToCommand(
    nextState: Optional<boolean>,
  ): Optional<StateCommandAndStatus> {
    if (nextState === undefined) {
      this.logger.warn('Power was not specified, ignoring command');
      return;
    }

    return {
      command: [
        {
          command: 'turn',
          data: {
            value: nextState ? '1' : '0',
          },
        },
        {
          command: 'turn',
          data: {
            val: nextState === true ? '1' : '0',
          },
        },
      ],
      status: {
        state: {
          isOn: nextState,
        },
      },
    };
  }
}
