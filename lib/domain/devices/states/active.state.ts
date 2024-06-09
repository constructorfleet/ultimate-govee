import { OpType, Optional, asOpCode, isTypeOf } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const ActiveStateName: 'isActive' = 'isActive' as const;
export type ActiveStateName = typeof ActiveStateName;

export type ActiveData = {
  state?: {
    isOn?: boolean;
  };
};

export class ActiveState extends DeviceOpState<
  ActiveStateName,
  Optional<boolean>
> {
  protected readonly parseOption: ParseOption = ParseOption.opCode.or(
    ParseOption.state,
  );
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    identifier: number[] = [0x01],
  ) {
    super({ opType, identifier }, device, ActiveStateName, undefined);
  }

  parseState(data: ActiveData): void {
    if (!isTypeOf(data.state?.isOn, 'boolean')) {
      return;
    }

    this.stateValue.next(data.state.isOn);
  }

  parseOpCommand(opCommand: number[]) {
    if (![0x00, 0x01].includes(opCommand[0])) {
      return;
    }
    this.stateValue.next(opCommand[0] === 0x01);
  }

  protected readonly stateToCommand = (
    state: Optional<boolean>,
  ): Optional<StateCommandAndStatus> => {
    if (!isTypeOf(state, 'boolean')) {
      this.logger.warn('state not provided, skipping command.');
      return undefined;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(OpType.COMMAND, this.identifier!, state ? 0x01 : 0x00),
          ],
        },
      },
      status: {
        op: {
          command: [[state ? 0x01 : 0x00]],
        },
      },
    };
  };
}
