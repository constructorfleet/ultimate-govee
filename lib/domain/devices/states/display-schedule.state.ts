import { OpType, Optional, asOpCode, isTypeOf } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption, StateCommandAndStatus } from './states.types';

export const DisplayScheduleStateName: 'displaySchedule' =
  'displaySchedule' as const;
export type DisplayScheduleStateName = typeof DisplayScheduleStateName;

export type DisplaySchedule = {
  on?: boolean;
  from?: {
    hour?: number;
    minute?: number;
  };
  to?: {
    hour?: number;
    minute?: number;
  };
};

export class DisplayScheduleState extends DeviceOpState<
  DisplayScheduleStateName,
  DisplaySchedule
> {
  protected parseOption: ParseOption = 'opCode';

  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, DisplayScheduleStateName, {});
  }

  parseOpCommand(opCommand: number[]) {
    const [on, fromHour, fromMinute, toHour, toMinute] = opCommand.slice(0, 7);
    this.stateValue.next({
      on: on === 0x01,
      from: {
        hour: fromHour,
        minute: fromMinute,
      },
      to: {
        hour: toHour,
        minute: toMinute,
      },
    });
  }

  protected stateToCommand(
    state: DisplaySchedule,
  ): Optional<StateCommandAndStatus> {
    if (
      !isTypeOf(state?.on, 'boolean') ||
      !isTypeOf(state?.from?.hour, 'number') ||
      !isTypeOf(state?.from?.minute, 'number') ||
      !isTypeOf(state?.to?.hour, 'number') ||
      !isTypeOf(state?.to?.minute, 'number')
    ) {
      this.logger.warn('Missing or invalide state, ignoring command');
      return;
    }

    const isOn = state.on === true;
    const values = isOn
      ? [
          state.from.hour ?? 0x00,
          state.from.minute ?? 0x00,
          state.to.hour ?? 0x00,
          state.to.minute ?? 0x00,
        ]
      : [];
    return {
      status: {
        op: {
          command: [[state.on ? 0x01 : 0x00]],
        },
      },
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              ...this.identifier!,
              state.on ? 0x01 : 0x00,
              ...values,
            ),
          ],
        },
      },
    };
  }
}
