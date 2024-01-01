import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';

export const ControlLockStateName: 'controlLock' = 'controlLock' as const;
export type ControlLockStateName = typeof ControlLockStateName;

export class ControlLockState extends DeviceOpState<
  ControlLockStateName,
  boolean | undefined
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x0a,
  ) {
    super({ opType, identifier }, device, ControlLockStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    this.stateValue.next(opCommand[0] === 0x01);
  }
}
