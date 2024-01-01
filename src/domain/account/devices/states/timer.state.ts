import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const TimerStateName: 'timer' = 'timer' as const;
export type TimerStateName = typeof TimerStateName;

export type Timer = {
  enabled?: boolean;
  duration?: number;
};

export class TimerState extends DeviceOpState<TimerStateName, Timer> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x0b,
  ) {
    super({ opType, identifier }, device, TimerStateName, {
      enabled: undefined,
      duration: undefined,
    });
  }

  parseOpCommand(opCommand: number[]) {
    let duration: number | undefined;
    if (opCommand.length <= 3) {
      duration = opCommand[1] * 0xff + opCommand[2];
    }
    this.stateValue.next({
      enabled: opCommand[0] === 0x01,
      duration,
    });
  }
}
