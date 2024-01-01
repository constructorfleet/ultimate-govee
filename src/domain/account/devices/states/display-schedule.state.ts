import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

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
    opType: number = 0xaa,
    identifier: number = 0x12,
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
}
