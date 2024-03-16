import { total, Optional, asOpCode, ArrayRange } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { OpType } from '../../../common/op-code';
import { StateCommandAndStatus } from './states.types';

export const TimerStateName: 'timer' = 'timer' as const;
export type TimerStateName = typeof TimerStateName;

export type Timer = {
  enabled?: boolean;
  duration?: number;
};

export class TimerState extends DeviceOpState<TimerStateName, Timer> {
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
    let duration: Optional<number>;
    if (opCommand.length <= 3) {
      duration = total(opCommand.slice(1, 3));
    }
    this.stateValue.next({
      enabled: opCommand[0] === 0x01,
      duration,
    });
  }

  protected stateToCommand(state: Timer): Optional<StateCommandAndStatus> {
    if (state.enabled === undefined) {
      this.logger.warn('Enabled not included in state, ignoring command.');
      return undefined;
    }
    if (state.duration === undefined) {
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
              state.enabled ? 0x01 : 0x00,
              state.duration >> 8,
              state.duration % 256,
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
