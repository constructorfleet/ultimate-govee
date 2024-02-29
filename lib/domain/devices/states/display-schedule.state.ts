import { OpType, Optional, asOpCode } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState, StateCommandAndStatus } from './device.state';

export const DisplayScheduleStateName: 'displaySchedule' =
  'displaySchedule' as const;
export type DisplayScheduleStateName = typeof DisplayScheduleStateName;

export type DisplaySchedule = {
  on?: boolean;
  from: {
    hour?: number;
    minute?: number;
  };
  to: {
    hour?: number;
    minute?: number;
  };
};

export class DisplayScheduleState extends DeviceOpState<
  DisplayScheduleStateName,
  DisplaySchedule
> {
  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, DisplayScheduleStateName, {
      on: undefined,
      from: {
        hour: undefined,
        minute: undefined,
      },
      to: {
        hour: undefined,
        minute: undefined,
      },
    });
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
    if (state.on === undefined) {
      this.logger.warn('On not included in state, ignoring command.');
      return undefined;
    }
    if (state.from.hour === undefined && state.from.minute === undefined) {
      this.logger.warn('From not included in state, ignoring command.');
      return undefined;
    }
    if (state.to.hour === undefined && state.to.minute === undefined) {
      this.logger.warn('To not included in state, ignoring command.');
      return undefined;
    }
    return {
      status: {
        op: {
          command: [
            [
              state.on ? 0x01 : 0x00,
              state.from.hour ?? 0x00,
              state.from.minute ?? 0x00,
              state.to.hour ?? 0x00,
              state.to.minute ?? 0x00,
            ],
          ],
        },
      },
      command: {
        data: {
          command: [
            asOpCode(
              OpType.COMMAND,
              ...this.identifier!,
              state.on ? 0x01 : 0x00,
              state.from.hour ?? 0x00,
              state.from.minute ?? 0x00,
              state.to.hour ?? 0x00,
              state.to.minute ?? 0x00,
            ),
          ],
        },
      },
    };
  }
}
