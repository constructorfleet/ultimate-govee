import { DeviceOpState } from '../../../states';
import { DeviceModel } from '../../../devices.model';

export const UVCStateName: 'isUVCActive' = 'isUVCActive' as const;
export type UVCStateName = typeof UVCStateName;

export class HumidiferUVCState extends DeviceOpState<
  UVCStateName,
  boolean | undefined
> {
  constructor(
    device: DeviceModel,
    opType: number = 0xaa,
    identifier: number = 0x1a,
  ) {
    super({ opType, identifier }, device, UVCStateName, undefined);
  }

  parseOpCommand(opCommand: number[]): void {
    this.stateValue.next(opCommand[0] === 0x01);
  }
}
