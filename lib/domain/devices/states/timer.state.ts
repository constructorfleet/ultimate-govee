import {
  total,
  Optional,
  asOpCode,
  ArrayRange,
  isTypeOf,
} from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const TimerStateName: 'timer' = 'timer' as const;
export type TimerStateName = typeof TimerStateName;

export type Timer = {
  enabled?: boolean;
  duration?: number;
};

export class TimerState extends DeviceOpState<TimerStateName, Timer> {
  protected parseOption: ParseOption = 'opCode';

  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, TimerStateName, {
      enabled: undefined,
      duration: undefined,
    });
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next({
      enabled: opCommand[0] === 0x01,
      duration: total(opCommand.slice(1, 3)),
    });
  }

  protected stateToCommand(state: Timer): Optional<StateCommandAndStatus> {
    const enabled = state.enabled;
    const duration = state.duration;
    if (!isTypeOf(enabled, 'boolean')) {
      this.logger.warn('Enabled not included in state, ignoring command.');
      return undefined;
    }
    if (!isTypeOf(duration, 'number')) {
      this.logger.warn('Duration not included in state, ignoring command.');
      return undefined;
    }

    return {
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              ...this.identifier!,
              enabled ? 0x01 : 0x00,
              duration >> 8,
              duration % 256,
            ),
          ],
        },
      },
      status: ArrayRange(15).map((x) => ({
        op: {
          command: [
            [
              state.enabled ? 0x01 : 0x00,
              (state.duration! - x) >> 8,
              (state.duration! - x) % 256,
            ],
          ],
        },
      })),
    };
  }
}
