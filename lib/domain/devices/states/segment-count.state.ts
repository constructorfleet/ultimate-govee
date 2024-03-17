import { isTypeOf, Optional, OpType } from '~ultimate-govee-common';
import { DeviceModel } from '../devices.model';
import { DeviceOpState } from './device.state';
import { ParseOption } from './states.types';

export const SegmentCountStateName: 'segmentCount' = 'segmentCount' as const;
export type SegmentCountStateName = typeof SegmentCountStateName;

export type SegmentCount = {
  segments?: number;
  groups?: number[];
};

export class SegmentCountState extends DeviceOpState<
  SegmentCountStateName,
  Optional<number>
> {
  protected parseOption: ParseOption = 'opCode';

  constructor(
    device: DeviceModel,
    opType: number = OpType.REPORT,
    ...identifier: number[]
  ) {
    super({ opType, identifier }, device, SegmentCountStateName, undefined);
  }

  parseOpCommand(opCommand: number[]) {
    const segments = opCommand[2];
    if (isTypeOf(segments, 'number')) {
      this.stateValue.next(segments);
    }
  }
}
