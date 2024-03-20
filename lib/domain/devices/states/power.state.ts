import { OpType, Optional, isTypeOf } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const PowerStateName: 'power' = 'power' as const;
export type PowerStateName = typeof PowerStateName;

export type PowerType = {
  isOn?: boolean;
  state?: {
    isOn?: boolean;
    onOff?: boolean;
  };
};

export class PowerState extends DeviceOpState<
  PowerStateName,
  Optional<boolean>
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x01],
  ) {
    super(
      { opType, identifier },
      device,
      PowerStateName,
      undefined,
      ParseOption.opCode.union(ParseOption.state),
    );
  }

  parseState(data: PowerType) {
    const { isOn, state } = data;
    if (isTypeOf(isOn, 'boolean')) {
      this.stateValue.next(isOn);
    } else {
      const { onOff, isOn } = state ?? {};
      if (isTypeOf(onOff, 'boolean')) {
        this.stateValue.next(onOff);
      } else if (isTypeOf(isOn, 'boolean')) {
        this.stateValue.next(isOn);
      }
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
